// backend/src/database/entities/message.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';

// Entities --------------------------------------------------------------
import { Thread } from './thread.entity';
import { User } from './user.entity';

// ====================================================================
// # MESSAGE ENTITY
// ====================================================================
//
// Represents a single chat message inside a Thread.
// Supports both text and optional image messages.
//
// Cascades:
// - Deleting a Thread deletes its Messages
// - Deleting a User deletes their sent Messages
//

@Entity('messages')
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
