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

  @Column({ type: 'date' })
  birthday: string;

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

  @Column({ type: 'varchar' })
  datingPreference:
    | 'hookups'
    | 'situationship'
    | 'short_term_relationship'
    | 'short_term_open'
    | 'long_term_open'
    | 'long_term_relationship';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
