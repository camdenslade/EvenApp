// src/utils/datingPreference.ts
// ============================================================================
// getDatingPreferenceLabel.ts
// ============================================================================
//
// PURPOSE:
//   Converts an internal DatingPreference enum value into a *user-friendly
//   display label*, with age-aware logic for specific options.
//
// WHY AGE MATTERS:
//   • For users age < 25:
//       "situationship" → "Situationship"
//   • For users age ≥ 25:
//       "situationship" → "Short-term Relationship"
//   This matches the same filtering logic used in onboarding and profile edit.
//
// INPUT:
//   pref : DatingPreference
//   age  : number
//
// OUTPUT:
//   Human-readable label string.
//
// EXAMPLE:
//   getDatingPreferenceLabel("short_term_open", 22)
//   → "Short-term, open to long"
//
// ============================================================================

import { DatingPreference } from "../types/user";

export function getDatingPreferenceLabel(pref: DatingPreference, age: number) {
  switch (pref) {
    case "hookups":
      return "Hookups Only";

    case "situationship":
      // Age-aware mapping
      return age < 25 ? "Situationship" : "Short-term Relationship";

    case "short_term_relationship":
      return "Short-term Relationship";

    case "short_term_open":
      return "Short-term, open to long";

    case "long_term_open":
      return "Long-term, open to short";

    case "long_term_relationship":
      return "Long-term Relationship";

    default:
      return "";
  }
}
