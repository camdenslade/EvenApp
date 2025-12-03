import { Entity, PrimaryGeneratedColumn, OneToMany, Column } from 'typeorm';

import { Message } from './message.entity';

@Entity()
export class Thread {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  matchId: string;

  @OneToMany(() => Message, (message) => message.thread)
  messages: Message[];
}
