// backend/src/matches/matches.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

// Entities --------------------------------------------------------------
import { Match } from '../database/entities/match.entity';
import { Thread } from '../database/entities/thread.entity';
import { Profile } from '../database/entities/profile.entity';

// Services --------------------------------------------------------------
import { ProfilesService } from '../profiles/profiles.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(Match)
    private readonly matchesRepo: Repository<Match>,

    @InjectRepository(Thread)
    private readonly threadsRepo: Repository<Thread>,

    @InjectRepository(Profile)
    private readonly profilesRepo: Repository<Profile>,

    private readonly users: UsersService,
    private readonly profiles: ProfilesService,
  ) {}

  // ====================================================================
  // # CREATE MATCH
  // ====================================================================
  /**
   * Creates a match between uidA and uidB.
   *
   * Steps:
   *  - Ensure both users exist
   *  - Prevent duplicate matches (bidirectional)
   *  - Save Match entity
   *  - Automatically create chat Thread for match
   */
  async createMatch(uidA: string, uidB: string) {
    await this.users.ensureUserExists(uidA, null, null);
    await this.users.ensureUserExists(uidB, null, null);

    // Check for existing match in either direction
    const existing = await this.matchesRepo.findOne({
      where: [
        { userAUid: uidA, userBUid: uidB },
        { userAUid: uidB, userBUid: uidA },
      ],
    });

    if (existing) return existing;

    // Create match
    const match = this.matchesRepo.create({
      userAUid: uidA,
      userBUid: uidB,
    });
    const saved = await this.matchesRepo.save(match);

    // Create chat thread
    const thread = this.threadsRepo.create({
      matchId: saved.id,
    });
    await this.threadsRepo.save(thread);

    return saved;
  }

  // ====================================================================
  // # GET USER MATCHES
  // ====================================================================
  /**
   * Returns all matches for a user, including the other user's profile.
   */
  async getMatches(uid: string) {
    const matches = await this.matchesRepo.find({
      where: [{ userAUid: uid }, { userBUid: uid }],
    });

    const otherUserUids = matches.map((m) =>
      m.userAUid === uid ? m.userBUid : m.userAUid,
    );

    const profiles = await this.profilesRepo.find({
      where: { userUid: In(otherUserUids) },
    });

    return matches.map((match) => {
      const otherUid = match.userAUid === uid ? match.userBUid : match.userAUid;

      return {
        matchId: match.id,
        userUid: otherUid,
        profile: profiles.find((p) => p.userUid === otherUid) || null,
        createdAt: match.createdAt,
      };
    });
  }

  // ====================================================================
  // # GET MATCHES WITH NO MESSAGES FROM CURRENT USER
  // ====================================================================
  /**
   * Returns matches where the authenticated user has NOT sent a message yet.
   *
   * Used for prompting “Say Hello” reminders.
   */
  async getUnmessagedMatches(uid: string) {
    const matches = await this.matchesRepo.find({
      where: [{ userAUid: uid }, { userBUid: uid }],
    });

    if (matches.length === 0) return [];

    const matchIds = matches.map((m) => m.id);

    const threads = await this.threadsRepo.find({
      where: { matchId: In(matchIds) },
      relations: ['messages', 'messages.sender'],
    });

    // Filter threads that have *no* messages from the current user
    const unmessaged = threads.filter((t) => {
      return !t.messages.some((msg) => msg.sender?.uid === uid);
    });

    if (unmessaged.length === 0) return [];

    const unmessagedMatchIds = unmessaged.map((t) => t.matchId);

    // Filter matches to only those with unmessaged threads
    const filteredMatches = matches.filter((m) =>
      unmessagedMatchIds.includes(m.id),
    );

    const otherUserUids = filteredMatches.map((m) =>
      m.userAUid === uid ? m.userBUid : m.userAUid,
    );

    const profiles = await this.profilesRepo.find({
      where: { userUid: In(otherUserUids) },
    });

    return filteredMatches.map((match) => {
      const otherUid = match.userAUid === uid ? match.userBUid : match.userAUid;

      return {
        matchId: match.id,
        userUid: otherUid,
        profile: profiles.find((p) => p.userUid === otherUid) || null,
        createdAt: match.createdAt,
      };
    });
  }
}
