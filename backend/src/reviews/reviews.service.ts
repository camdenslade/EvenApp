import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Review } from '../database/entities/review.entity';
import { ReviewStrike } from '../database/entities/review-strike.entity';
import { ReviewWeekWindow } from '../database/entities/review-week-window.entity';
import { ReviewEmergency } from '../database/entities/review-emergency.entity';

import { UsersService } from '../users/users.service';
import { ChatService } from '../chat/chat.service';
import { FLAGGED_WORDS } from './keywords';

interface CreateReviewDto {
  reviewerUid: string;
  targetUid: string;
  rating: number;
  comment: string;
  type: 'normal' | 'emergency' | 'report';
  phoneNumberSnapshot?: string | null;
}

@Injectable()
export class ReviewsService {
  private readonly WEEK_MS = 7 * 24 * 60 * 60 * 1000;

  private readonly STRIKE_TIMEOUT_HOURS: Record<number, number> = {
    1: 24,
    2: 72,
    3: 168,
  };

  private readonly FLAGGED_WORDS = FLAGGED_WORDS;

  constructor(
    @InjectRepository(Review)
    private readonly reviewsRepo: Repository<Review>,

    @InjectRepository(ReviewStrike)
    private readonly strikesRepo: Repository<ReviewStrike>,

    @InjectRepository(ReviewWeekWindow)
    private readonly weekRepo: Repository<ReviewWeekWindow>,

    @InjectRepository(ReviewEmergency)
    private readonly emergencyRepo: Repository<ReviewEmergency>,

    private readonly users: UsersService,
    private readonly chat: ChatService,
  ) {}

  private async alreadyReviewed(reviewerUid: string, targetUid: string) {
    const existing = await this.reviewsRepo.findOne({
      where: { reviewerUid, targetUid },
    });
    return existing !== null;
  }

  private containsFlaggedWord(comment: string): boolean {
    const lower = comment.toLowerCase();
    return this.FLAGGED_WORDS.some((w) => lower.includes(w));
  }

  private async issueStrike(uid: string, reason: string): Promise<number> {
    const user = await this.users.getByUid(uid);
    if (!user) throw new NotFoundException('User not found for strike');

    const previousStrikes = await this.strikesRepo.count({
      where: { user: { uid } },
    });

    const strikeNumber = previousStrikes + 1;
    const timeoutHours = this.STRIKE_TIMEOUT_HOURS[strikeNumber] ?? 0;

    const expiresAt = new Date(Date.now() + timeoutHours * 3600 * 1000);

    const strike = this.strikesRepo.create({
      user,
      reason,
      strikeNumber,
      timeoutHours,
      timeoutExpiresAt: expiresAt,
    });

    await this.strikesRepo.save(strike);

    if (strikeNumber === 3) {
      const penalty = this.reviewsRepo.create({
        reviewerUid: 'SYSTEM',
        targetUid: uid,
        rating: 2,
        comment: 'System penalty for repeated abusive reviews.',
        type: 'normal',
        approved: true,
      });
      await this.reviewsRepo.save(penalty);
    }

    return strikeNumber;
  }

  private async getOrCreateWeekWindow(uid: string): Promise<ReviewWeekWindow> {
    const user = await this.users.getByUid(uid);
    if (!user) throw new NotFoundException('User not found');

    const now = new Date();

    const existing = await this.weekRepo.findOne({
      where: { user: { id: user.id } },
    });

    if (!existing) {
      const newWindow = this.weekRepo.create({
        user,
        windowStart: now,
        windowEnd: new Date(now.getTime() + this.WEEK_MS),
        reviewsUsed: 0,
      });
      return this.weekRepo.save(newWindow);
    }

    if (now > existing.windowEnd) {
      existing.windowStart = now;
      existing.windowEnd = new Date(now.getTime() + this.WEEK_MS);
      existing.reviewsUsed = 0;
      await this.weekRepo.save(existing);
    }

    return existing;
  }

  private async hasTwoWayChat(aUid: string, bUid: string) {
    const msgs = await this.chat.getMessagesBetweenUsers(aUid, bUid);
    if (msgs.length === 0) return false;

    const fromA = msgs.filter((m) => m.sender?.uid === aUid);
    const fromB = msgs.filter((m) => m.sender?.uid === bUid);

    return fromA.length >= 2 && fromB.length >= 2;
  }

  private async hasReceivedOneMessage(reviewerUid: string, targetUid: string) {
    const msgs = await this.chat.getMessagesBetweenUsers(
      reviewerUid,
      targetUid,
    );
    return msgs.some((m) => m.sender?.uid === targetUid);
  }

  private async getEmergencyRecord(reviewerUid: string, targetUid: string) {
    return this.emergencyRepo.findOne({
      where: {
        reviewer: { uid: reviewerUid },
        target: { uid: targetUid },
      },
    });
  }

  async createReview(dto: CreateReviewDto) {
    const { reviewerUid, targetUid, rating, comment, type } = dto;

    if (reviewerUid === targetUid) {
      throw new BadRequestException('You cannot review yourself.');
    }

    const reviewer = await this.users.getByUid(reviewerUid);
    const target = await this.users.getByUid(targetUid);
    if (!reviewer || !target) {
      throw new NotFoundException('User not found.');
    }

    if (await this.alreadyReviewed(reviewerUid, targetUid)) {
      throw new ForbiddenException('You already reviewed this user.');
    }

    const isEmergency = type === 'emergency';
    const isReport = type === 'report';

    if (isEmergency) {
      const existing = await this.getEmergencyRecord(reviewerUid, targetUid);
      if (existing?.used) {
        throw new ForbiddenException(
          'You already used your emergency review for this user.',
        );
      }
      if (!reviewer.phone) {
        throw new ForbiddenException(
          'Emergency reviews require a verified phone number.',
        );
      }
    }

    if (isReport) {
      const allowed = await this.hasReceivedOneMessage(reviewerUid, targetUid);
      if (!allowed) {
        throw new ForbiddenException(
          'You may only report after receiving at least ONE message from the user.',
        );
      }
    }

    if (!isEmergency && !isReport) {
      const ok = await this.hasTwoWayChat(reviewerUid, targetUid);
      if (!ok) {
        throw new ForbiddenException(
          'Both users must exchange at least 2 messages each before reviewing.',
        );
      }
    }

    let window: ReviewWeekWindow | null = null;
    if (!isEmergency && !isReport) {
      const active = await this.getOrCreateWeekWindow(reviewerUid);

      if (active.reviewsUsed >= 3) {
        throw new ForbiddenException('You used all 3 reviews this week.');
      }

      if (active.reviewsUsed === 0 && (rating < 3 || rating > 10)) {
        throw new BadRequestException('First review must be between 3–10.');
      }
      if (active.reviewsUsed === 1 && (rating < 5 || rating > 10)) {
        throw new BadRequestException('Second review must be between 5–10.');
      }
      if (active.reviewsUsed === 2 && (rating < 3 || rating > 10)) {
        throw new BadRequestException('Third review must be between 3–10.');
      }

      window = active;
    }

    if (this.containsFlaggedWord(comment)) {
      const strike = await this.issueStrike(
        reviewerUid,
        'Keyword moderation violation',
      );
      throw new ForbiddenException(
        `Strike ${strike} applied due to abusive review content.`,
      );
    }

    const review = this.reviewsRepo.create({
      reviewerUid,
      targetUid,
      rating,
      comment,
      type,
      reviewer,
      target,
      approved: true,
    });

    await this.reviewsRepo.save(review);

    if (window) {
      window.reviewsUsed += 1;
      await this.weekRepo.save(window);
    }

    if (isEmergency) {
      const existing =
        (await this.getEmergencyRecord(reviewerUid, targetUid)) ||
        this.emergencyRepo.create({
          reviewer,
          target,
        });

      existing.used = true;
      existing.usedAt = new Date();
      existing.phoneNumberSnapshot = reviewer.phone ?? null;

      await this.emergencyRepo.save(existing);
    }

    return review;
  }

  async getUserReviews(uid: string) {
    return this.reviewsRepo.find({
      where: { targetUid: uid },
      order: { createdAt: 'DESC' },
    });
  }

  async getUserAverage(uid: string) {
    const reviews = await this.getUserReviews(uid);
    if (reviews.length === 0) return null;

    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    return Number(avg.toFixed(1));
  }

  async getWeeklyUsage(uid: string) {
    const user = await this.users.getByUid(uid);
    if (!user) throw new NotFoundException('User not found');

    const window = await this.weekRepo.findOne({
      where: { user: { id: user.id } },
    });

    if (!window) return { used: 0, remaining: 3 };

    return {
      used: window.reviewsUsed,
      remaining: 3 - window.reviewsUsed,
    };
  }
}
