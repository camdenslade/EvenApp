import { Module } from '@nestjs/common';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { FirebaseModule } from '../firebase/firebase.module';
import { AuthModule } from '../auth/auth.module';
import { S3Module } from 'src/s3/s3.module';

@Module({
  imports: [FirebaseModule, AuthModule, S3Module],
  controllers: [ProfilesController],
  providers: [ProfilesService],
})
export class ProfilesModule {}
