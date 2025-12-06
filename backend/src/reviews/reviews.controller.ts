// backend/src/reviews/reviews.controller.ts

import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';

// Services --------------------------------------------------------------
import { ReviewsService } from './reviews.service';

// DTOs ------------------------------------------------------------------
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewResponseDto } from './dto/review-response.dto';
import { ReviewWeekUsageDto } from './dto/review-week-usage.dto';

// Guards ----------------------------------------------------------------
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';

// Request Typing --------------------------------------------------------
interface FirebaseRequest {
  user: { uid: string };
}

@Controller('reviews')
@UseGuards(FirebaseAuthGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // ====================================================================
  // # CREATE REVIEW
  // ====================================================================
  /**
   * POST /reviews
   *
   * Creates a review from the authenticated user.
   * Wraps response in ReviewResponseDto.
   */
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

  // ====================================================================
  // # GET REVIEWS FOR A USER
  // ====================================================================
  /**
   * GET /reviews/user/:uid
   *
   * Returns all reviews written *about* a given user.
   */
  @Get('user/:uid')
  async getUserReviews(@Param('uid') uid: string) {
    const reviews = await this.reviewsService.getUserReviews(uid);
    return reviews.map((r) => new ReviewResponseDto(r));
  }

  // ====================================================================
  // # GET USER AVERAGE RATING
  // ====================================================================
  /**
   * GET /reviews/user/:uid/average
   *
   * Returns a user's average rating (1 decimal place).
   */
  @Get('user/:uid/average')
  async getUserAverage(@Param('uid') uid: string) {
    return this.reviewsService.getUserAverage(uid);
  }

  // ====================================================================
  // # GET REVIEWS FOR AUTHENTICATED USER
  // ====================================================================
  /**
   * GET /reviews/me
   *
   * Returns all reviews the logged-in user has received.
   */
  @Get('me')
  async getMyReviews(@Req() req: FirebaseRequest) {
    const uid = req.user.uid;
    const reviews = await this.reviewsService.getUserReviews(uid);
    return reviews.map((r) => new ReviewResponseDto(r));
  }

  // ====================================================================
  // # GET SUMMARY FOR AUTHENTICATED USER
  // ====================================================================
  /**
   * GET /reviews/summary/me
   *
   * Returns:
   * - average rating
   * - total count of reviews
   * - weekly usage (used / remaining)
   */
  @Get('summary/me')
  async getMySummary(@Req() req: FirebaseRequest) {
    const uid = req.user.uid;

    const average = await this.reviewsService.getUserAverage(uid);
    const weekly = await this.reviewsService.getWeeklyUsage(uid);
    const allReviews = await this.reviewsService.getUserReviews(uid);

    return {
      average,
      count: allReviews.length,
      week: new ReviewWeekUsageDto(weekly.used, weekly.remaining),
    };
  }

  // ====================================================================
  // # GET WEEKLY REVIEW USAGE FOR AUTHENTICATED USER
  // ====================================================================
  /**
   * GET /reviews/me/week-usage
   *
   * Returns how many reviews the current user used this week,
   * and how many remain out of the weekly limit.
   */
  @Get('me/week-usage')
  async getWeeklyUsage(@Req() req: FirebaseRequest) {
    const result = await this.reviewsService.getWeeklyUsage(req.user.uid);
    return new ReviewWeekUsageDto(result.used, result.remaining);
  }
}
