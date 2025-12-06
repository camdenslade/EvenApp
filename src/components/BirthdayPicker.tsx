// src/components/BirthdayPicker.tsx

// React Native ---------------------------------------------------------
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

// ====================================================================
// # TYPES
// ====================================================================

/**
 * Represents a selected birthday value.
 */
export interface BirthdayValue {
  year: number;
  month: number; // 0-based index (0 = January)
  day: number;
}

/**
 * Props for the BirthdayPicker component.
 */
export interface BirthdayPickerProps {
  value: BirthdayValue;

  /**
   * Fires when the user selects any of month/day/year.
   */
  onChange: (v: BirthdayValue) => void;
}

// UI constants ---------------------------------------------------------
const ITEM_HEIGHT = 42;

// ====================================================================
// # BIRTHDAY PICKER COMPONENT
// ====================================================================
//
// A simple 3-column scrollable picker:
//  - Column 1: Month (Jan–Dec)
//  - Column 2: Day (1–31 depending on month/year)
//  - Column 3: Year (current year → 100 years back)
//
// Displays the selected value in highlighted styling.
// Calls onChange whenever any piece of date is selected.
//

export function BirthdayPicker({ value, onChange }: BirthdayPickerProps) {
  // Generate a rolling 100-year list from the current year
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  // Months displayed as short names
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  // Compute the number of days for the selected month/year
  const daysInMonth = new Date(value.year, value.month + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <View style={styles.container}>
      {/* -------------------------------------------------------------- */}
      {/* MONTH COLUMN                                                   */}
      {/* -------------------------------------------------------------- */}
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

      {/* -------------------------------------------------------------- */}
      {/* DAY COLUMN                                                     */}
      {/* -------------------------------------------------------------- */}
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

      {/* -------------------------------------------------------------- */}
      {/* YEAR COLUMN                                                    */}
      {/* -------------------------------------------------------------- */}
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

// ====================================================================
// # STYLES
// ====================================================================

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: '100%',
    height: 160,
  },
  column: {
    flex: 1,
  },
  item: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    color: '#aaa',
    fontSize: 18,
  },
  selected: {
    color: 'white',
    fontWeight: '600',
    fontSize: 20,
  },
});
