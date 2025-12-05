import { Entity, PrimaryGeneratedColumn, OneToMany, Column } from 'typeorm';
import { Message } from './message.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  uid: string;

  @Column({ nullable: true, type: 'varchar' })
  email: string | null;

  @Column({ nullable: true, type: 'varchar' })
  phone: string | null;

  @Column({ type: 'float', nullable: true })
  latitude: number | null;

  @Column({ type: 'float', nullable: true })
  longitude: number | null;

  @Column({ type: 'timestamptz', nullable: true })
  reviewTimeoutExpiresAt: Date | null;

  @OneToMany(() => Message, (message) => message.sender)
  messages: Message[];
}
