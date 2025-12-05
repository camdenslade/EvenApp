import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not, IsNull } from 'typeorm';

import { Thread } from '../database/entities/thread.entity';
import { Message } from '../database/entities/message.entity';
import { Match } from '../database/entities/match.entity';
import { Profile } from '../database/entities/profile.entity';
import { UsersService } from '../users/users.service';
import type { MatchThread } from '../../../src/types/chat'; // adjust path if needed

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Thread)
    private readonly threadsRepo: Repository<Thread>,

    @InjectRepository(Message)
    private readonly messagesRepo: Repository<Message>,

    @InjectRepository(Match)
    private readonly matchesRepo: Repository<Match>,

    @InjectRepository(Profile)
    private readonly profilesRepo: Repository<Profile>,

    private readonly users: UsersService,
  ) {}

  async getThreadForMatch(matchId: string): Promise<Thread> {
    const thread = await this.threadsRepo.findOne({
      where: { matchId },
    });
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

    const saved = await this.messagesRepo.save(msg);

    const thread = await this.threadsRepo.findOne({
      where: { id: threadId },
    });
    if (!thread) return saved;

    const match = await this.matchesRepo.findOne({
      where: { id: thread.matchId },
    });

    if (match && !match.firstMessageAt) {
      match.firstMessageAt = new Date();
      await this.matchesRepo.save(match);
    }

    return saved;
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

  async getUserThreads(uid: string): Promise<MatchThread[]> {
    const matches = await this.matchesRepo.find({
      where: [
        { userAUid: uid, firstMessageAt: Not(IsNull()) },
        { userBUid: uid, firstMessageAt: Not(IsNull()) },
      ],
    });

    if (matches.length === 0) return [];

    const threads = await this.threadsRepo.find({
      where: {
        matchId: In(matches.map((m) => m.id)),
      },
    });

    const result: MatchThread[] = [];

    for (const t of threads) {
      const match = matches.find((m) => m.id === t.matchId);
      if (!match) continue;

      const partnerUid =
        match.userAUid === uid ? match.userBUid : match.userAUid;

      const profile = await this.profilesRepo.findOne({
        where: { userUid: partnerUid },
      });
      if (!profile) continue;

      const lastMsg = await this.messagesRepo.findOne({
        where: { threadId: t.id },
        order: { createdAt: 'DESC' },
      });

      const lastTimestamp = lastMsg?.createdAt
        ? lastMsg.createdAt.getTime()
        : 0;

      result.push({
        threadId: t.id,
        user: {
          uid: partnerUid,
          name: profile.name,
          profileImageUrl: profile.photos?.[0] ?? '',
        },
        lastMessage: lastMsg?.text ?? null,
        lastTimestamp,
      });
    }

    return result.sort((a, b) => b.lastTimestamp - a.lastTimestamp);
  }

  async getMessagesBetweenUsers(
    uidA: string,
    uidB: string,
  ): Promise<Message[]> {
    const match = await this.matchesRepo.findOne({
      where: [
        { userAUid: uidA, userBUid: uidB },
        { userAUid: uidB, userBUid: uidA },
      ],
    });

    if (!match) return [];

    const thread = await this.threadsRepo.findOne({
      where: { matchId: match.id },
    });
    if (!thread) return [];

    return this.messagesRepo.find({
      where: { threadId: thread.id },
      order: { createdAt: 'ASC' },
    });
  }
}
