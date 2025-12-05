import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Profile } from '../database/entities/profile.entity';
import { Swipe } from '../database/entities/swipe.entity';
import { UsersService } from '../users/users.service';
import { S3Service } from '../s3/s3.service';
import { SetupProfileDto } from './dto/setup-profile.dto';

export interface ProfileResponse extends Profile {
  profileImageUrl: string | null;
  age: number;
}

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

  private calculateAge(birthday: string): number {
    const b = new Date(birthday);
    const diff = Date.now() - b.getTime();
    return new Date(diff).getUTCFullYear() - 1970;
  }

  async getProfile(uid: string): Promise<ProfileResponse | null> {
    const profile = await this.profilesRepo.findOne({
      where: { userUid: uid },
    });

    if (!profile) return null;

    return {
      ...profile,
      profileImageUrl: profile.photos?.[0] ?? null,
      age: this.calculateAge(profile.birthday),
    };
  }

  async checkStatus(uid: string): Promise<{ status: 'missing' | 'complete' }> {
    const p = await this.getProfile(uid);
    return { status: p ? 'complete' : 'missing' };
  }

  async createUploadUrl() {
    return this.s3.createUploadUrl();
  }

  async setup(uid: string, dto: SetupProfileDto): Promise<ProfileResponse> {
    await this.usersService.ensureUserExists(uid, null, null);

    let profile = await this.profilesRepo.findOne({ where: { userUid: uid } });

    if (!profile) {
      profile = this.profilesRepo.create({
        userUid: uid,
        ...dto,
      });
    } else {
      Object.assign(profile, dto);
    }

    const saved = await this.profilesRepo.save(profile);

    return {
      ...saved,
      profileImageUrl: saved.photos?.[0] ?? null,
      age: this.calculateAge(saved.birthday),
    };
  }

  async updateProfile(
    uid: string,
    data: Partial<Profile>,
  ): Promise<ProfileResponse> {
    const profile = await this.profilesRepo.findOne({
      where: { userUid: uid },
    });

    if (!profile) throw new NotFoundException('Profile not found');

    Object.assign(profile, data);

    const saved = await this.profilesRepo.save(profile);

    return {
      ...saved,
      profileImageUrl: saved.photos?.[0] ?? null,
      age: this.calculateAge(saved.birthday),
    };
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

    const results = await query.orderBy('RANDOM()').limit(20).getMany();

    return results.map((p) => ({
      ...p,
      profileImageUrl: p.photos?.[0] ?? null,
      age: this.calculateAge(p.birthday),
    }));
  }
}
