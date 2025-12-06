// backend/src/database/entities/user.entity.ts

import { Entity, PrimaryGeneratedColumn, OneToMany, Column } from 'typeorm';

// Entities --------------------------------------------------------------
import { Message } from './message.entity';

// ====================================================================
// # USER ENTITY
// ====================================================================
//
// Core identity model for the app.
// Represents an authenticated Firebase user.
//
// Stores:
//  - email + phone (synced on each login)
//  - location (lat/lng + last update time)
//  - review timeout (moderation)
//  - messages sent by this user
//

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // --------------------------------------------------------------------
  // # FIREBASE IDENTIFIER
  // --------------------------------------------------------------------
  @Column({ unique: true })
  uid: string;

  // --------------------------------------------------------------------
  // # CONTACT INFO
  // --------------------------------------------------------------------
  @Column({ type: 'varchar', nullable: true })
  email: string | null;

  @Column({ type: 'varchar', nullable: true })
  phone: string | null;

  // --------------------------------------------------------------------
  // # LOCATION
  // --------------------------------------------------------------------
  @Column({ type: 'float', nullable: true })
  latitude: number | null;

  @Column({ type: 'float', nullable: true })
  longitude: number | null;

  @Column({ type: 'timestamptz', nullable: true })
  lastLocationUpdate: Date | null;

  // --------------------------------------------------------------------
  // # REVIEW TIMEOUT (MODERATION)
  // --------------------------------------------------------------------
  @Column({ type: 'timestamptz', nullable: true })
  reviewTimeoutExpiresAt: Date | null;

  // --------------------------------------------------------------------
  // # RELATIONS
  // --------------------------------------------------------------------
  @OneToMany(() => Message, (message) => message.sender)
  messages: Message[];
}
