import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Swipe } from '../database/entities/swipe.entity';
import { SwipeDto } from './dto/swipe.dto';

import { UsersService } from '../users/users.service';
import { ProfilesService } from '../profiles/profiles.service';
import { MatchesService } from '../matches/matches.service';

@Injectable()
export class SwipeService {
  constructor(
    @InjectRepository(Swipe)
    private readonly swipeRepo: Repository<Swipe>,

    private readonly users: UsersService,
    private readonly profiles: ProfilesService,
    private readonly matches: MatchesService,
  ) {}

  async swipe(swiperUid: string, dto: SwipeDto) {
    const { targetUid, direction } = dto;

    await this.users.ensureUserExists(swiperUid, null, null);

    const targetUser = await this.users.getByUid(targetUid);
    if (!targetUser) return { error: 'target user does not exist' };

    const targetProfile = await this.profiles.getProfile(targetUid);
    if (!targetProfile) return { error: 'target user has no profile' };

    const existing = await this.swipeRepo.findOne({
      where: { swiperUid, targetUid },
    });

    if (existing) return { swipe: existing, matchCreated: false };

    const swipe = this.swipeRepo.create({
      swiperUid,
      targetUid,
      direction,
    });
    await this.swipeRepo.save(swipe);

    if (direction === 'like') {
      const reciprocal = await this.swipeRepo.findOne({
        where: {
          swiperUid: targetUid,
          targetUid: swiperUid,
          direction: 'like',
        },
      });

      if (reciprocal) {
        const match = await this.matches.createMatch(swiperUid, targetUid);
        return { swipe, matchCreated: true, match };
      }
    }

    return { swipe, matchCreated: false };
  }
}
