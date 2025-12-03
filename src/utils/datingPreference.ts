import { DatingPreference } from "../types/user";

export function getDatingPreferenceLabel(pref: DatingPreference, age: number) {
  switch (pref) {
    case 'hookups':
      return 'Hookups Only';

    case 'situationship':
      return age < 25 ? 'Situationship' : 'Short-term Relationship';

    case 'short_term_relationship':
      return 'Short-term Relationship';

    case 'short_term_open':
      return 'Short-term, open to long';

    case 'long_term_open':
      return 'Long-term, open to short';

    case 'long_term_relationship':
      return 'Long-term Relationship';

    default:
      return '';
  }
}
