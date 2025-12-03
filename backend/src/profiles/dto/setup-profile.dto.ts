import { IsString, IsInt, Min, Max, IsArray, IsIn } from 'class-validator';

export class SetupProfileDto {
  @IsString()
  name: string;

  @IsInt()
  @Min(18)
  @Max(99)
  age: number;

  @IsString()
  bio: string;

  @IsIn(['male', 'female'])
  sex: 'male' | 'female';

  @IsIn(['male', 'female', 'everyone'])
  sexPreference: 'male' | 'female' | 'everyone';

  @IsArray()
  interests: string[];

  @IsArray()
  photos: string[];
}
