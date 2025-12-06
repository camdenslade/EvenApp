// backend/src/database/entities/review-week-window.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

// Entities --------------------------------------------------------------
import { User } from './user.entity';

// ====================================================================
// # REVIEW WEEK WINDOW ENTITY
// ====================================================================
//
// Tracks a user's weekly review quota window.
//
// Includes:
//  - windowStart, windowEnd: 7-day rolling period
//  - reviewsUsed: remaining quota (max 3 per week)
//  - ties directly to User
//

@Entity({ name: 'review_week_windows' })
export class ReviewWeekWindow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // --------------------------------------------------------------------
  // # USER RELATION
  // --------------------------------------------------------------------
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @Index()
  user: User;

  // --------------------------------------------------------------------
  // # WEEK WINDOW METADATA
  // --------------------------------------------------------------------
  @Column({ type: 'timestamptz' })
  windowStart: Date;

  @Column({ type: 'timestamptz' })
  windowEnd: Date;

  @Column({ type: 'int', default: 0 })
  reviewsUsed: number;

  // --------------------------------------------------------------------
  // # TIMESTAMPS
  // --------------------------------------------------------------------
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
