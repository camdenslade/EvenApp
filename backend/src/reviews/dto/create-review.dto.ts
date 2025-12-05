import {
  IsString,
  IsNotEmpty,
  IsIn,
  IsNumber,
  Min,
  Max,
  IsOptional,
} from 'class-validator';

export class CreateReviewDto {
  @IsString()
  @IsNotEmpty()
  reviewerUid: string;

  @IsString()
  @IsNotEmpty()
  targetUid: string;

  @IsNumber()
  @Min(1)
  @Max(10)
  rating: number;

  @IsString()
  @IsNotEmpty()
  comment: string;

  @IsIn(['normal', 'emergency', 'report'])
  type: 'normal' | 'emergency' | 'report';

  @IsOptional()
  @IsString()
  phoneNumberSnapshot?: string | null;
}
