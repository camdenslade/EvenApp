import {
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Injectable,
  Inject,
} from '@nestjs/common';
import * as admin from 'firebase-admin';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email: string | null;
    phone: string | null;
  };
}

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(@Inject('FIREBASE_ADMIN') private firebase: typeof admin) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: AuthenticatedRequest = context.switchToHttp().getRequest();
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer '))
      throw new UnauthorizedException('Missing authorization header');

    const token = header.split(' ')[1];

    try {
      const decoded = await this.firebase.auth().verifyIdToken(token);

      req.user = {
        uid: decoded.uid,
        email: decoded.email ?? null,
        phone: decoded.phone_number ?? null,
      };

      return true;
    } catch {
      throw new UnauthorizedException('Invalid Firebase token');
    }
  }
}
