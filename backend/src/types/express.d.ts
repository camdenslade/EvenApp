// backend/src/types/express-user.d.ts

// ====================================================================
// # EXPRESS REQUEST USER EXTENSION
// ====================================================================
//
// Extends Express.Request with a `user` object injected by FirebaseAuthGuard.
// This allows strong typing throughout the backend where `req.user` is used.
//

import 'express';

declare module 'express' {
  interface Request {
    user?: {
      uid: string;
      email: string | null;
      phone: string | null;
    };
  }
}
