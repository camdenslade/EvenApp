// backend/src/auth/firebase/firebase-user.decorator.ts

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

// Types ---------------------------------------------------------------
export interface FirebaseAuthedUser {
  uid: string;
  email: string | null;
}

// ====================================================================
// # FIREBASE USER DECORATOR
// ====================================================================
//
// Extracts the authenticated Firebase user (attached by FirebaseAuthGuard)
// and injects it directly into controller route handlers.
//
// Usage:
//   @Get('me')
//   async getMe(@FirebaseUser() user: FirebaseAuthedUser) {}
//

export const FirebaseUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): FirebaseAuthedUser | undefined => {
    const req = ctx.switchToHttp().getRequest<Request>();
    return req.user as FirebaseAuthedUser | undefined;
  },
);
