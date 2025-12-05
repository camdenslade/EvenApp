import { Review } from '../database/entities/review.entity';
import { ReviewResponseDto } from './dto/review-response.dto';

export class ReviewMapper {
  static toResponse(review: Review): ReviewResponseDto {
    return new ReviewResponseDto(review);
  }

  static toResponses(reviews: Review[]): ReviewResponseDto[] {
    return reviews.map((r) => new ReviewResponseDto(r));
  }
}
