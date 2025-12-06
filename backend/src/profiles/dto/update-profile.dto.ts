// backend/src/profiles/dto/update-profile.dto.ts

import {
  IsDateString,
  IsString,
  IsOptional,
  IsArray,
  IsIn,
} from 'class-validator';

// ====================================================================
// # UPDATE PROFILE DTO
// ====================================================================
//
// Allows partial updates to a user's profile.
// All fields are optional and validated only if present.
//

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsDateString()
  birthday?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsIn(['male', 'female'])
  sex?: 'male' | 'female';

  @IsOptional()
  @IsIn(['male', 'female', 'everyone'])
  sexPreference?: 'male' | 'female' | 'everyone';

  @IsOptional()
  @IsIn([
    'hookups',
    'situationship',
    'short_term_relationship',
    'short_term_open',
    'long_term_open',
    'long_term_relationship',
  ])
  datingPreference?:
    | 'hookups'
    | 'situationship'
    | 'short_term_relationship'
    | 'short_term_open'
    | 'long_term_open'
    | 'long_term_relationship';

  @IsOptional()
  @IsArray()
  interests?: string[];

  @IsOptional()
  @IsArray()
  photos?: string[];
}
