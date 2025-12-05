// src/components/BirthdayPicker.tsx
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity
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

  return (
    <View style={styles.container}>
      <ScrollView style={styles.column} showsVerticalScrollIndicator={false}>
        {months.map((m, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.item}
            onPress={() => onChange({ ...value, month: idx })}
          >
            <Text
              style={[
                styles.itemText,
                value.month === idx && styles.selected,
              ]}
            >
              {m}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.column} showsVerticalScrollIndicator={false}>
        {days.map((d) => (
          <TouchableOpacity
            key={d}
            style={styles.item}
            onPress={() => onChange({ ...value, day: d })}
          >
            <Text
              style={[
                styles.itemText,
                value.day === d && styles.selected,
              ]}
            >
              {d}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.column} showsVerticalScrollIndicator={false}>
        {years.map((y) => (
          <TouchableOpacity
            key={y}
            style={styles.item}
            onPress={() => onChange({ ...value, year: y })}
          >
            <Text
              style={[
                styles.itemText,
                value.year === y && styles.selected,
              ]}
            >
              {y}
            </Text>
          </TouchableOpacity>
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
