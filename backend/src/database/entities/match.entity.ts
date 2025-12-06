// backend/src/database/entities/match.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

// ====================================================================
// # MATCH ENTITY
// ====================================================================
//
// Represents a successful mutual like between two users.
// Each Match is paired with a Thread (chat) object.
// Tracks when the first message was sent for analytics / UX.
//

@Entity('matches')
export class Match {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userAUid: string;

  @Column()
  userBUid: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  firstMessageAt: Date | null;
}
