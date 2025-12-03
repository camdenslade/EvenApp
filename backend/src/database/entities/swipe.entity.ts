import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('swipes')
export class Swipe {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  swiperUid: string;

  @Column()
  targetUid: string;

  @Column()
  direction: 'like' | 'pass';

  @CreateDateColumn()
  createdAt: Date;
}
