// backend/src/reviews/dto/review-week-usage.dto.ts

// ====================================================================
// # REVIEW WEEK USAGE DTO
// ====================================================================
//
// Represents how many weekly review slots a user has used and how many
// remain out of the total weekly allocation (3).
//

export class ReviewWeekUsageDto {
  used: number;
  remaining: number;

  constructor(used: number, remaining: number) {
    this.used = used;
    this.remaining = remaining;
  }
}
