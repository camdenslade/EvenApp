// src/database/typeorm.config.ts
import { DataSourceOptions } from 'typeorm';

import { User } from './entities/user.entity';
import { Profile } from './entities/profile.entity';
import { Swipe } from './entities/swipe.entity';
import { Match } from './entities/match.entity';
import { Message } from './entities/message.entity';
import { Thread } from './entities/thread.entity';

export const typeormConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: 5432,
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'devpassword',
  database: process.env.DB_NAME || 'evenapp',

  synchronize: true,
  logging: false,

  entities: [User, Profile, Swipe, Match, Message, Thread],
};
