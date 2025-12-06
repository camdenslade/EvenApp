// backend/src/swipe/dto/swipe.dto.ts

import { IsString, IsIn } from 'class-validator';

// ====================================================================
// # SWIPE DTO
// ====================================================================
//
// Represents the payload for performing a swipe action.
// Validates:
//  - target user UID must be a string
//  - direction must be either "like" or "pass"
//

export class SwipeDto {
  @IsString()
  targetUid: string;

  @IsIn(['pass'])
  direction: 'pass';
}
