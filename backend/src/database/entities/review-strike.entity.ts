// backend/src/database/entities/review-strike.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
} from 'typeorm';

// Entities --------------------------------------------------------------
import { User } from './user.entity';

// ====================================================================
// # REVIEW STRIKE ENTITY
// ====================================================================
//
// Represents a moderation strike applied to a user for violating
// review guidelines (e.g., abusive language, keyword violations).
//
// Each strike has:
//  - reason
//  - strike number (1–3)
//  - timeout duration and expiration
//

@Entity({ name: 'review_strikes' })
export class ReviewStrike {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // --------------------------------------------------------------------
  // # USER RELATION
  // --------------------------------------------------------------------
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @Index()
  user: User;

  // --------------------------------------------------------------------
  // # STRIKE DETAILS
  // --------------------------------------------------------------------
  @Column({ type: 'varchar', length: 255 })
  reason: string;

  @Column({ type: 'int' })
  strikeNumber: number;

  @Column({ type: 'int' })
  timeoutHours: number;

  @Column({ type: 'timestamptz' })
  timeoutExpiresAt: Date;

  // --------------------------------------------------------------------
  // # TIMESTAMP
  // --------------------------------------------------------------------
  @CreateDateColumn()
  createdAt: Date;
}
