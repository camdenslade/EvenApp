import {
  IsDateString,
  IsString,
  IsOptional,
  IsArray,
  IsIn,
} from 'class-validator';

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
