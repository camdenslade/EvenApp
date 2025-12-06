// backend/src/database/entities/profile.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

// Entities --------------------------------------------------------------
import { User } from './user.entity';

// ====================================================================
// # PROFILE ENTITY
// ====================================================================
//
// Stores all user-visible profile metadata.
// Connected 1:1 with User via userUid.
//
// Includes:
//  - identity (name, birthday, bio)
//  - preferences (sex, sexPreference, datingPreference)
//  - assets (photos)
//  - onboarding status (paused flag)
//

@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userUid: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userUid', referencedColumnName: 'uid' })
  user: User;

  // --------------------------------------------------------------------
  // # BASIC INFO
  // --------------------------------------------------------------------
  @Column()
  name: string;

  @Column({ type: 'date' })
  birthday: string;

  @Column()
  bio: string;

  // --------------------------------------------------------------------
  // # SEX & PREFERENCES
  // --------------------------------------------------------------------
  @Column({ type: 'varchar' })
  sex: 'male' | 'female';

  @Column({ type: 'varchar' })
  sexPreference: 'male' | 'female' | 'everyone';

  @Column({ type: 'varchar' })
  datingPreference:
    | 'hookups'
    | 'situationship'
    | 'short_term_relationship'
    | 'short_term_open'
    | 'long_term_open'
    | 'long_term_relationship';

  // --------------------------------------------------------------------
  // # PHOTOS & INTERESTS
  // --------------------------------------------------------------------
  @Column('text', { array: true })
  interests: string[];

  @Column('text', { array: true })
  photos: string[];

  // --------------------------------------------------------------------
  // # PROFILE STATUS
  // --------------------------------------------------------------------
  @Column({ type: 'boolean', default: false })
  paused: boolean;

  // --------------------------------------------------------------------
  // # TIMESTAMPS
  // --------------------------------------------------------------------
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
