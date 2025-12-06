// backend/src/app.service.ts

import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  // ====================================================================
  // # SIMPLE TEST SERVICE
  // ====================================================================
  /**
   * Basic test endpoint used when verifying the server is running.
   * Not used in production business logic.
   */
  getHello(): string {
    return 'Hello World!';
  }
}
