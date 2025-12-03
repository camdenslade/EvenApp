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
