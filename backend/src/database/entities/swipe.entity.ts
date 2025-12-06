// backend/src/database/entities/swipe.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

// ====================================================================
// # SWIPE ENTITY
// ====================================================================
//
// Represents a single swipe action:
//  - swiperUid → the user performing the swipe
//  - targetUid → the user being swiped on
//  - direction → 'pass'
//
// Used for queue logic, match creation, and analytics.
//

@Entity('swipes')
export class Swipe {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  swiperUid: string;

  @Column()
  targetUid: string;

  @Column()
  direction: 'pass';

  @CreateDateColumn()
  createdAt: Date;
}
