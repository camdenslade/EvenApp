// backend/src/database/typeorm.config.ts

import { DataSourceOptions } from 'typeorm';

// Entities --------------------------------------------------------------
import { User } from './entities/user.entity';
import { Profile } from './entities/profile.entity';
import { Swipe } from './entities/swipe.entity';
import { Match } from './entities/match.entity';
import { Thread } from './entities/thread.entity';
import { Message } from './entities/message.entity';

import { Review } from './entities/review.entity';
import { ReviewStrike } from './entities/review-strike.entity';
import { ReviewWeekWindow } from './entities/review-week-window.entity';
import { ReviewEmergency } from './entities/review-emergency.entity';

import { SafetyIdentity } from './entities/safety-identity.entity';
import { Block } from './entities/block.entity';

// ====================================================================
// # TYPEORM CONFIGURATION
// ====================================================================
//
// Centralized database config for Nest + TypeORM.
// Loads all entities used across the application.
//

export const typeormConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: 5432,

  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'devpassword',
  database: process.env.DB_NAME || 'evenapp',

  synchronize: true, // DEVELOPMENT ONLY — disable in production
  logging: false,

  entities: [
    // core
    User,
    Profile,
    Swipe,
    Match,
    Thread,
    Message,

    // reviews subsystem
    Review,
    ReviewStrike,
    ReviewWeekWindow,
    ReviewEmergency,

    // safety + blocking
    SafetyIdentity,
    Block,
  ],
};
