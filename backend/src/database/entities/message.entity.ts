import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';

import { Thread } from './thread.entity';
import { User } from './user.entity';

@Entity()
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  threadId: string;

  @ManyToOne(() => Thread, (thread) => thread.messages, {
    onDelete: 'CASCADE',
  })
  thread: Thread;

  @Column()
  senderId: string;

  @ManyToOne(() => User, (user) => user.messages, {
    eager: true,
    onDelete: 'CASCADE',
  })
  sender: User;

  @Column({ type: 'text' })
  text: string;

  @Column({ type: 'text', nullable: true })
  imageUrl: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
