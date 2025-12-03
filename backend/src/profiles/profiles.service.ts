import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Profile } from '../database/entities/profile.entity';
import { Swipe } from '../database/entities/swipe.entity';
import { UsersService } from '../users/users.service';
import { S3Service } from '../s3/s3.service';
import { SetupProfileDto } from './dto/setup-profile.dto';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(Profile)
    private readonly profilesRepo: Repository<Profile>,

    @InjectRepository(Swipe)
    private readonly swipeRepo: Repository<Swipe>,

    private readonly usersService: UsersService,
    private readonly s3: S3Service,
  ) {}

  async getProfile(uid: string): Promise<Profile | null> {
    return this.profilesRepo.findOne({
      where: { userUid: uid },
    });
  }

  async checkStatus(uid: string): Promise<'missing' | 'complete'> {
    const p = await this.getProfile(uid);
    return p ? 'complete' : 'missing';
  }

  async createUploadUrl(fileType: string) {
    return this.s3.createUploadUrl(fileType);
  }

  async setup(uid: string, dto: SetupProfileDto): Promise<Profile> {
    await this.usersService.ensureUserExists(uid, null, null);

    let profile = await this.getProfile(uid);

    if (!profile) {
      profile = this.profilesRepo.create({
        userUid: uid,
        ...dto,
      });
    } else {
      Object.assign(profile, dto);
    }

    return this.profilesRepo.save(profile);
  }

  async updateProfile(uid: string, data: Partial<Profile>): Promise<Profile> {
    const profile = await this.getProfile(uid);
    if (!profile) throw new NotFoundException('Profile not found');

    Object.assign(profile, data);

    return this.profilesRepo.save(profile);
  }

  async getSwipeQueue(uid: string) {
    const myProfile = await this.getProfile(uid);
    if (!myProfile) return [];

    const swiped = await this.swipeRepo.find({
      where: { swiperUid: uid },
    });

    const swipedIds = new Set(swiped.map((s) => s.targetUid));
    swipedIds.add(uid);

    const query = this.profilesRepo
      .createQueryBuilder('p')
      .where('p.userUid NOT IN (:...uids)', { uids: Array.from(swipedIds) });

    if (myProfile.sexPreference !== 'everyone') {
      query.andWhere('p.sex = :pref', { pref: myProfile.sexPreference });
    }

    query.andWhere('p.sexPreference IN (:...accepted)', {
      accepted: ['everyone', myProfile.sex],
    });

    query.orderBy('RANDOM()');

    return query.limit(20).getMany();
  }
}
