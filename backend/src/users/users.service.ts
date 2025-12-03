import { Injectable } from '@nestjs/common';
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
}
