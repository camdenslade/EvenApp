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

@Entity({ name: 'review_emergency' })
export class ReviewEmergency {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @Index()
  reviewer: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @Index()
  target: User;

  @Column({ type: 'boolean', default: false })
  used: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  usedAt: Date | null;

  @Column({ type: 'varchar', nullable: true })
  phoneNumberSnapshot: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
