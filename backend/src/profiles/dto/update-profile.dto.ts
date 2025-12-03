import {
  IsInt,
  IsString,
  IsOptional,
  Min,
  Max,
  IsArray,
  IsIn,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(18)
  @Max(99)
  age?: number;

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
  @IsArray()
  interests?: string[];

  @IsOptional()
  @IsArray()
  photos?: string[];

  @IsOptional()
  @IsString()
  interestedInSex?: string;
}
