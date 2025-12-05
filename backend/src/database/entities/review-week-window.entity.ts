import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'review_week_windows' })
export class ReviewWeekWindow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @Index()
  user: User;

  @Column({ type: 'timestamptz' })
  windowStart: Date;

  @Column({ type: 'timestamptz' })
  windowEnd: Date;

  @Column({ type: 'int', default: 0 })
  reviewsUsed: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
