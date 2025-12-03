import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userUid: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userUid', referencedColumnName: 'uid' })
  user: User;

  @Column()
  name: string;

  @Column({ type: 'int' })
  age: number;

  @Column()
  bio: string;

  @Column({ type: 'varchar' })
  sex: 'male' | 'female';

  @Column({ type: 'varchar' })
  sexPreference: 'male' | 'female' | 'everyone';

  @Column('text', { array: true })
  interests: string[];

  @Column('text', { array: true })
  photos: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
