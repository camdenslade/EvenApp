// backend/src/database/entities/safety-identity.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

// ====================================================================
// # SAFETY IDENTITY ENTITY
// ====================================================================
//
// Persistent record used to prevent:
//  - ban evasion
//  - emergency review abuse
//  - strike reset manipulation
//
// Stored even after a user account is deleted.
// Contains historical moderation metadata tied to a phone number.
//

@Entity('safety_identities')
export class SafetyIdentity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // --------------------------------------------------------------------
  // # USER IDENTIFIER (PERSISTENT)
  // --------------------------------------------------------------------
  @Column({ type: 'varchar' })
  phone: string;

  // --------------------------------------------------------------------
  // # BEHAVIOR & ABUSE METRICS
  // --------------------------------------------------------------------
  @Column({ type: 'boolean', default: false })
  emergencyUsed: boolean;

  @Column({ type: 'int', default: 0 })
  strikes: number;

  @Column({ type: 'timestamptz', nullable: true })
  lastReviewTimeout: Date | null;

  // --------------------------------------------------------------------
  // # TIMESTAMP
  // --------------------------------------------------------------------
  @CreateDateColumn()
  createdAt: Date;
}
