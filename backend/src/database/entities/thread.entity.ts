// backend/src/database/entities/thread.entity.ts

import { Entity, PrimaryGeneratedColumn, OneToMany, Column } from 'typeorm';

// Entities --------------------------------------------------------------
import { Message } from './message.entity';

// ====================================================================
// # THREAD ENTITY
// ====================================================================
//
// Represents a chat thread associated with a Match.
// Contains all messages exchanged between the two matched users.
// A Thread has many Messages.
//
// Deleting a Thread (via match deletion) cascades to all messages.
//

@Entity('threads')
export class Thread {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  matchId: string;

  @OneToMany(() => Message, (message) => message.thread)
  messages: Message[];
}
