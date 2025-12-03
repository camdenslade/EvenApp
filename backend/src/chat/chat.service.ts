import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import { Thread } from '../database/entities/thread.entity';
import { Message } from '../database/entities/message.entity';
import { Match } from '../database/entities/match.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Thread)
    private readonly threadsRepo: Repository<Thread>,

    @InjectRepository(Message)
    private readonly messagesRepo: Repository<Message>,

    @InjectRepository(Match)
    private readonly matchesRepo: Repository<Match>,

    private readonly users: UsersService,
  ) {}

  async getThreadForMatch(matchId: string): Promise<Thread> {
    const thread = await this.threadsRepo.findOne({ where: { matchId } });
    if (!thread) throw new NotFoundException('Thread not found');
    return thread;
  }

  async getMessages(threadId: string): Promise<Message[]> {
    return this.messagesRepo.find({
      where: { threadId },
      order: { createdAt: 'ASC' },
    });
  }

  async sendMessage(threadId: string, senderUid: string, content: string) {
    const sender = await this.users.getByUid(senderUid);
    if (!sender) throw new Error('User not found');

    const msg = this.messagesRepo.create({
      threadId,
      senderId: sender.id,
      text: content,
      imageUrl: null,
    });

    return this.messagesRepo.save(msg);
  }

  async userCanAccessThread(uid: string, threadId: string): Promise<boolean> {
    const thread = await this.threadsRepo.findOne({
      where: { id: threadId },
    });
    if (!thread) return false;

    const match = await this.matchesRepo.findOne({
      where: { id: thread.matchId },
    });
    if (!match) return false;

    return match.userAUid === uid || match.userBUid === uid;
  }

  async getUserThreads(uid: string) {
    const matches = await this.matchesRepo.find({
      where: [{ userAUid: uid }, { userBUid: uid }],
    });

    const threads = await this.threadsRepo.find({
      where: {
        matchId: In(matches.map((m) => m.id)),
      },
    });

    return threads;
  }
}
