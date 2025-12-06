// backend/src/reviews/review.mapper.ts

// Entities --------------------------------------------------------------
import { Review } from '../database/entities/review.entity';

// DTOs ------------------------------------------------------------------
import { ReviewResponseDto } from './dto/review-response.dto';

// ====================================================================
// # REVIEW MAPPER
// ====================================================================
//
// Converts Review entities into DTOs used by the API layer.
//

export class ReviewMapper {
  /**
   * Maps a single Review entity → ReviewResponseDto.
   */
  static toResponse(review: Review): ReviewResponseDto {
    return new ReviewResponseDto(review);
  }

  /**
   * Maps an array of Review entities → array of ReviewResponseDto.
   */
  static toResponses(reviews: Review[]): ReviewResponseDto[] {
    return reviews.map((r) => new ReviewResponseDto(r));
  }
}
