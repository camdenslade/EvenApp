import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../database/entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  async ensureUserExists(
    uid: string,
    email: string | null,
    phone: string | null,
  ): Promise<User> {
    let user = await this.usersRepo.findOne({ where: { uid } });

    if (!user) {
      user = this.usersRepo.create({
        uid,
        email,
        phone,
        reviewTimeoutExpiresAt: null,
      });
      await this.usersRepo.save(user);
    } else {
      user.email = email;
      user.phone = phone;
      await this.usersRepo.save(user);
    }

    return user;
  }

  async getByUid(uid: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { uid } });
  }

  async updateLocation(uid: string, lat: number, lng: number) {
    const user = await this.usersRepo.findOne({ where: { uid } });
    if (!user) throw new NotFoundException('User not found');

    user.latitude = lat;
    user.longitude = lng;

    await this.usersRepo.save(user);
    return { success: true };
  }

  async setReviewTimeout(uid: string, durationMs: number): Promise<void> {
    const user = await this.usersRepo.findOne({ where: { uid } });
    if (!user) throw new NotFoundException('User not found');

    const expires = new Date(Date.now() + durationMs);
    user.reviewTimeoutExpiresAt = expires;

    await this.usersRepo.save(user);
  }

  async clearReviewTimeout(uid: string): Promise<void> {
    const user = await this.usersRepo.findOne({ where: { uid } });
    if (!user) throw new NotFoundException('User not found');

    user.reviewTimeoutExpiresAt = null;
    await this.usersRepo.save(user);
  }

  async getReviewTimeout(uid: string): Promise<Date | null> {
    const user = await this.usersRepo.findOne({ where: { uid } });
    if (!user) throw new NotFoundException('User not found');

    return user.reviewTimeoutExpiresAt ?? null;
  }

  async isUserTimedOut(uid: string): Promise<boolean> {
    const user = await this.usersRepo.findOne({ where: { uid } });
    if (!user) throw new NotFoundException('User not found');

    if (!user.reviewTimeoutExpiresAt) return false;

    return user.reviewTimeoutExpiresAt.getTime() > Date.now();
  }
}
