import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

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
