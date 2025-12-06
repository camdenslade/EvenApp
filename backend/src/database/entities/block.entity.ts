// backend/src/database/entities/block.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

// ====================================================================
// # BLOCK ENTITY
// ====================================================================
//
// Represents a block relationship between users.
// A block prevents messaging, matching, swiping, and appearing in searches.
//

@Entity('blocks')
export class Block {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  blockerUid: string;

  @Column()
  blockedUid: string;

  @CreateDateColumn()
  createdAt: Date;
}
