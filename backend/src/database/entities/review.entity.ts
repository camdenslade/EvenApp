// backend/src/database/entities/review.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Unique,
  Index,
} from 'typeorm';

// Entities --------------------------------------------------------------
import { User } from './user.entity';

// ====================================================================
// # REVIEW ENTITY
// ====================================================================
//
// Stores a single user review (normal, emergency, or report).
// Includes moderation metadata for:
//  - keyword scanning
//  - LLM analysis
//  - human review flow
//  - strike issuance
//
// Unique Constraint:
//  - A user may only review another user once.
//

@Entity('reviews')
@Unique(['reviewerUid', 'targetUid'])
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // --------------------------------------------------------------------
  // # IDENTIFIERS
  // --------------------------------------------------------------------
  @Index()
  @Column({ type: 'varchar' })
  reviewerUid: string;

  @Index()
  @Column({ type: 'varchar' })
  targetUid: string;

  // --------------------------------------------------------------------
  // # REVIEW CONTENT
  // --------------------------------------------------------------------
  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'text' })
  comment: string;

  @Column({ type: 'varchar' })
  type: 'normal' | 'emergency' | 'report';

  // --------------------------------------------------------------------
  // # SAFETY & MODERATION
  // --------------------------------------------------------------------
  @Column({ type: 'varchar', nullable: true })
  phoneNumberUsed: string | null;

  @Column({ type: 'boolean', default: false })
  flaggedByKeywordScan: boolean;

  @Column({ type: 'boolean', default: false })
  flaggedByLLM: boolean;

  @Column({ type: 'boolean', default: false })
  pendingHumanReview: boolean;

  @Column({ type: 'boolean', default: false })
  approved: boolean;

  @Column({ type: 'boolean', default: false })
  rejected: boolean;

  @Column({ type: 'boolean', default: false })
  strikeIssued: boolean;

  // --------------------------------------------------------------------
  // # TIMESTAMP
  // --------------------------------------------------------------------
  @CreateDateColumn()
  createdAt: Date;

  // --------------------------------------------------------------------
  // # RELATIONS
  // --------------------------------------------------------------------
  @ManyToOne(() => User, (user) => user.id, { eager: false })
  reviewer: User;

  @ManyToOne(() => User, (user) => user.id, { eager: false })
  target: User;
}
