// backend/src/main.ts

import { NestFactory } from '@nestjs/core';
import { config } from 'dotenv';

// Modules --------------------------------------------------------------
import { AppModule } from './app.module';

// Load .env -------------------------------------------------------------
config();

// ====================================================================
// # APPLICATION BOOTSTRAP
// ====================================================================
//
// Creates the NestJS application instance, applies global prefix,
// and starts the server.
//

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // All backend routes become /api/...
  app.setGlobalPrefix('api');

  await app.listen(3000);
}

void bootstrap();
