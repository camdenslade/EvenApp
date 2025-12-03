import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import { Match } from '../database/entities/match.entity';
import { Thread } from '../database/entities/thread.entity';
import { Profile } from '../database/entities/profile.entity';

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

  async createMatch(uidA: string, uidB: string) {
    await this.users.ensureUserExists(uidA, null, null);
    await this.users.ensureUserExists(uidB, null, null);

    const existing = await this.matchesRepo.findOne({
      where: [
        { userAUid: uidA, userBUid: uidB },
        { userAUid: uidB, userBUid: uidA },
      ],
    });

    if (existing) return existing;

    const match = this.matchesRepo.create({
      userAUid: uidA,
      userBUid: uidB,
    });
    const saved = await this.matchesRepo.save(match);

    const thread = this.threadsRepo.create({
      matchId: saved.id,
    });
    await this.threadsRepo.save(thread);

    return saved;
  }

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
}
