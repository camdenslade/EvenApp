import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { FirebaseAuthGuard } from './auth/guards/firebase-auth.guard';
import { AuthModule } from './auth/auth.module';

import { UsersModule } from './users/users.module';
import { ProfilesModule } from './profiles/profiles.module';
import { SwipeModule } from './swipe/swipe.module';
import { MatchesModule } from './matches/matches.module';
import { ChatModule } from './chat/chat.module';

import { TypeOrmModule } from '@nestjs/typeorm';
import { typeormConfig } from './database/typeorm.config';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeormConfig),
    AuthModule,
    UsersModule,
    ProfilesModule,
    SwipeModule,
    MatchesModule,
    ChatModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: FirebaseAuthGuard,
    },
  ],
})
export class AppModule {}
