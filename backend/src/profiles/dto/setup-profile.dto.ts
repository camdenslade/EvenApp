// backend/src/profiles/dto/setup-profile.dto.ts

import { IsString, IsArray, IsIn, IsDateString } from 'class-validator';

// ====================================================================
// # SETUP PROFILE DTO
// ====================================================================
//
// Used during onboarding to populate a user's full profile.
// Ensures all critical fields are validated before profile creation.
//

export class SetupProfileDto {
  @IsString()
  name: string;

  @IsDateString()
  birthday: string;

  @IsString()
  bio: string;

  @IsIn(['male', 'female'])
  sex: 'male' | 'female';

  @IsIn(['male', 'female', 'everyone'])
  sexPreference: 'male' | 'female' | 'everyone';

  @IsIn([
    'hookups',
    'situationship',
    'short_term_relationship',
    'short_term_open',
    'long_term_open',
    'long_term_relationship',
  ])
  datingPreference:
    | 'hookups'
    | 'situationship'
    | 'short_term_relationship'
    | 'short_term_open'
    | 'long_term_open'
    | 'long_term_relationship';

  @IsArray()
  interests: string[];

  @IsArray()
  photos: string[];
}
