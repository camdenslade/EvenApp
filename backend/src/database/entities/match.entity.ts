import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

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
}
