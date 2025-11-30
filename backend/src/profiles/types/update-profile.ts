import { Sex, SexPreference } from './setup-profile';

export interface UpdateProfileData {
  name?: string;
  age?: number;
  sex?: Sex;
  interestedInSex?: SexPreference;
  bio?: string;
  photos?: string[];
}
