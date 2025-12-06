// backend/src/database/entities/review-emergency.entity.ts

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
// # REVIEW EMERGENCY ENTITY
// ====================================================================
//
// Tracks "emergency reviews" — a special one-time review a user can leave
// without meeting normal chat/message requirements.
//
// Fields:
//  - reviewer (User)
//  - target (User)
//  - used flag + timestamp
//  - phoneNumberSnapshot (for audit & safety)
//

@Entity({ name: 'review_emergency' })
export class ReviewEmergency {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // --------------------------------------------------------------------
  // # REVIEWER → TARGET RELATIONSHIP
  // --------------------------------------------------------------------
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @Index()
  reviewer: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @Index()
  target: User;

  // --------------------------------------------------------------------
  // # EMERGENCY REVIEW FLAGS
  // --------------------------------------------------------------------
  @Column({ type: 'boolean', default: false })
  used: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  usedAt: Date | null;

  @Column({ type: 'varchar', nullable: true })
  phoneNumberSnapshot: string | null;

  // --------------------------------------------------------------------
  // # TIMESTAMPS
  // --------------------------------------------------------------------
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
