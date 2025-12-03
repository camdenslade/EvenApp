// src/components/BirthdayPicker.tsx
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";

export interface BirthdayValue {
  year: number;
  month: number;
  day: number;
}

export interface BirthdayPickerProps {
  value: BirthdayValue;
  onChange: (v: BirthdayValue) => void;
}

const ITEM_HEIGHT = 42;

export function BirthdayPicker({ value, onChange }: BirthdayPickerProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const daysInMonth = new Date(value.year, value.month + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const onScrollEnd = (
    e: NativeSyntheticEvent<NativeScrollEvent>,
    type: "month" | "day" | "year"
  ) => {
    const index = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);

    if (type === "month") {
      onChange({ ...value, month: index });
    }
    if (type === "day") {
      onChange({ ...value, day: index + 1 });
    }
    if (type === "year") {
      onChange({ ...value, year: years[index] });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.column}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onMomentumScrollEnd={(e) => onScrollEnd(e, "month")}
      >
        {months.map((m, idx) => (
          <View key={idx} style={styles.item}>
            <Text style={[styles.itemText, value.month === idx && styles.selected]}>
              {m}
            </Text>
          </View>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.column}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onMomentumScrollEnd={(e) => onScrollEnd(e, "day")}
      >
        {days.map((d) => (
          <View key={d} style={styles.item}>
            <Text style={[styles.itemText, value.day === d && styles.selected]}>
              {d}
            </Text>
          </View>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.column}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onMomentumScrollEnd={(e) => onScrollEnd(e, "year")}
      >
        {years.map((y) => (
          <View key={y} style={styles.item}>
            <Text style={[styles.itemText, value.year === y && styles.selected]}>
              {y}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    width: "100%",
    height: 160,
  },
  column: {
    flex: 1,
  },
  item: {
    height: ITEM_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  itemText: {
    color: "#aaa",
    fontSize: 18,
  },
  selected: {
    color: "white",
    fontWeight: "600",
    fontSize: 20,
  },
});
