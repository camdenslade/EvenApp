// backend/src/reviews/dto/review-response.dto.ts

// Entities --------------------------------------------------------------
import { Review } from '../../database/entities/review.entity';

// ====================================================================
// # REVIEW RESPONSE DTO
// ====================================================================
//
// Standard API response wrapper for a Review entity.
// Ensures the frontend only receives whitelisted properties.
//

export class ReviewResponseDto {
  id: string;
  reviewerUid: string;
  targetUid: string;
  rating: number;
  comment: string;
  type: 'normal' | 'emergency' | 'report';
  createdAt: Date;

  constructor(review: Review) {
    this.id = review.id;
    this.reviewerUid = review.reviewerUid;
    this.targetUid = review.targetUid;
    this.rating = review.rating;
    this.comment = review.comment;
    this.type = review.type;
    this.createdAt = review.createdAt;
  }
}
