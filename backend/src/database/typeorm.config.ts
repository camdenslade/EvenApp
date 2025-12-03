// typeorm.config.ts
import type { DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
config();

export const typeormConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,

  ssl: false,
  synchronize: false,
  logging: false,

  entities: ['dist/src/database/entities/*.js'],
  migrations: ['dist/src/database/migrations/*.js'],
};
