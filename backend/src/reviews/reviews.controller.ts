// src/reviews/reviews.controller.ts
import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewResponseDto } from './dto/review-response.dto';
import { ReviewWeekUsageDto } from './dto/review-week-usage.dto';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';

interface FirebaseRequest {
  user: { uid: string };
}

@Controller('reviews')
@UseGuards(FirebaseAuthGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  async createReview(
    @Req() req: FirebaseRequest,
    @Body() dto: CreateReviewDto,
  ) {
    const reviewerUid = req.user.uid;
    const review = await this.reviewsService.createReview({
      ...dto,
      reviewerUid,
    });
    return new ReviewResponseDto(review);
  }

  @Get('user/:uid')
  async getUserReviews(@Param('uid') uid: string) {
    const reviews = await this.reviewsService.getUserReviews(uid);
    return reviews.map((r) => new ReviewResponseDto(r));
  }

  @Get('user/:uid/average')
  async getUserAverage(@Param('uid') uid: string) {
    return this.reviewsService.getUserAverage(uid);
  }

  @Get('me/week-usage')
  async getWeeklyUsage(@Req() req: FirebaseRequest) {
    const result = await this.reviewsService.getWeeklyUsage(req.user.uid);
    return new ReviewWeekUsageDto(result.used, result.remaining);
  }
}
