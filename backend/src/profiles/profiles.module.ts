import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProfilesService } from './profiles.service';
import { ProfilesController } from './profiles.controller';

import { Profile } from '../database/entities/profile.entity';
import { Swipe } from '../database/entities/swipe.entity';
import { UsersModule } from '../users/users.module';
import { S3Module } from '../s3/s3.module';

@Module({
  imports: [TypeOrmModule.forFeature([Profile, Swipe]), UsersModule, S3Module],
  providers: [ProfilesService],
  controllers: [ProfilesController],
  exports: [ProfilesService],
})
export class ProfilesModule {}
