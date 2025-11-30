export type Sex = 'male' | 'female';
export type SexPreference = 'male' | 'female' | 'everyone';

export interface SetupProfileData {
  name: string;
  age: number;
  sex: Sex;
  interestedInSex: SexPreference;
  bio: string;
  photos: string[];
}
