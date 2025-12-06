// backend/src/app.module.ts

import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

// Guards ---------------------------------------------------------------
import { FirebaseAuthGuard } from './auth/guards/firebase-auth.guard';

// Modules --------------------------------------------------------------
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProfilesModule } from './profiles/profiles.module';
import { SwipeModule } from './swipe/swipe.module';
import { MatchesModule } from './matches/matches.module';
import { ChatModule } from './chat/chat.module';
import { SearchModule } from './search/search.module';
import { ReviewsModule } from './reviews/reviews.module';

// Database --------------------------------------------------------------
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeormConfig } from './database/typeorm.config';
import { SafetyIdentity } from './database/entities/safety-identity.entity';

// Config ---------------------------------------------------------------
import { ConfigModule } from '@nestjs/config';

@Module({
  // ====================================================================
  // # IMPORTS
  // ====================================================================
  imports: [
    // Environment Variables
    ConfigModule.forRoot({ isGlobal: true }),

    // TypeORM (Global Connection)
    TypeOrmModule.forRoot(typeormConfig),

    // Additional entity registration (local)
    TypeOrmModule.forFeature([SafetyIdentity]),

    // Feature Modules
    AuthModule,
    UsersModule,
    ProfilesModule,
    SwipeModule,
    MatchesModule,
    ChatModule,
    SearchModule,
    ReviewsModule,
  ],

  // ====================================================================
  // # PROVIDERS
  // ====================================================================
  providers: [
    {
      provide: APP_GUARD,
      useClass: FirebaseAuthGuard, // Global auth guard
    },
  ],
})
export class AppModule {}
