import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Unique,
  Index,
} from 'typeorm';
import { User } from './user.entity';

@Entity('reviews')
@Unique(['reviewerUid', 'targetUid'])
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar' })
  reviewerUid: string;

  @Index()
  @Column({ type: 'varchar' })
  targetUid: string;

  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'text' })
  comment: string;

  @Column({ type: 'varchar' })
  type: 'normal' | 'emergency' | 'report';

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

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.id, { eager: false })
  reviewer: User;

  @ManyToOne(() => User, (user) => user.id, { eager: false })
  target: User;
}
