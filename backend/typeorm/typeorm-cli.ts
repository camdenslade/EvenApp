// backend/typeorm-cli.ts

import 'reflect-metadata';
import { DataSource } from 'typeorm';

// Config ---------------------------------------------------------------
import { typeormConfig } from '../src/database/typeorm.config';

// ====================================================================
// # TYPEORM DATASOURCE (CLI SUPPORT)
// ====================================================================
//
// Used for TypeORM CLI commands such as:
//   - migration:generate
//   - migration:run
//   - schema:log
//
// This file adapts the existing application config for CLI tooling.
//

const AppDataSource = new DataSource(typeormConfig);

export default AppDataSource;
