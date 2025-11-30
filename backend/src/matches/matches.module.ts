import { Module } from '@nestjs/common';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { FirebaseModule } from '../firebase/firebase.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [FirebaseModule, JwtModule],
  controllers: [MatchesController],
  providers: [MatchesService],
})
export class MatchesModule {}
