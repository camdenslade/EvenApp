import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'review_strikes' })
export class ReviewStrike {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @Index()
  user: User;

  @Column({ type: 'varchar', length: 255 })
  reason: string;

  @Column({ type: 'int' })
  strikeNumber: number;

  @Column({ type: 'int' })
  timeoutHours: number;

  @Column({ type: 'timestamptz' })
  timeoutExpiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
