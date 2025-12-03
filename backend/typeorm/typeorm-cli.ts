import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { typeormConfig } from '../src/database/typeorm.config';

const AppDataSource = new DataSource(typeormConfig);

export default AppDataSource;
