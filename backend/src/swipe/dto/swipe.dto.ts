import { IsString, IsIn } from 'class-validator';

export class SwipeDto {
  @IsString()
  targetUid: string;

  @IsIn(['like', 'pass'])
  direction: 'like' | 'pass';
}
