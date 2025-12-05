import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Profile } from '../database/entities/profile.entity';
import { User } from '../database/entities/user.entity';

export interface ProfilePreview {
  id: string;
  name: string;
  age: number;
  bio: string;
  photoUrl: string | null;
  distanceMiles: number;
}

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepo: Repository<Profile>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  private calculateAge(birthday: string): number {
    const b = new Date(birthday);
    const diff = Date.now() - b.getTime();
    return new Date(diff).getUTCFullYear() - 1970;
  }

  private haversineMiles(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 3958.8;
    const toRad = (x: number) => (x * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

    return R * 2 * Math.asin(Math.sqrt(a));
  }

  async searchByName(
    uid: string,
    firstName: string,
    radiusMiles: number,
  ): Promise<ProfilePreview[]> {
    const user = await this.userRepo.findOne({ where: { uid } });
    if (!user || !user.latitude || !user.longitude) return [];

    const profiles = await this.profileRepo.find({
      where: { name: firstName },
    });

    const results: ProfilePreview[] = [];

    for (const p of profiles) {
      const targetUser = await this.userRepo.findOne({
        where: { uid: p.userUid },
      });

      if (!targetUser || !targetUser.latitude || !targetUser.longitude)
        continue;

      const distance = this.haversineMiles(
        user.latitude,
        user.longitude,
        targetUser.latitude,
        targetUser.longitude,
      );

      if (distance > radiusMiles) continue;

      results.push({
        id: p.id,
        name: p.name,
        age: this.calculateAge(p.birthday),
        bio: p.bio,
        photoUrl: p.photos?.[0] ?? null,
        distanceMiles: distance,
      });
    }

    return results.sort((a, b) => a.distanceMiles - b.distanceMiles);
  }
}
