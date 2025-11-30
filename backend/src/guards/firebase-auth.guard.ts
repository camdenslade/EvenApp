// backend/src/auth/firebase-auth.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import * as admin from 'firebase-admin';

export interface FirebaseUserPayload {
  uid: string;
  email: string | undefined;
}

export interface AuthenticatedRequest extends Request {
  user?: FirebaseUserPayload;
}

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const idToken = this.extractFirebaseToken(request);

    if (!idToken) {
      throw new UnauthorizedException('Firebase ID token is missing');
    }

    try {
      const decoded = await admin.auth().verifyIdToken(idToken);
      request.user = {
        uid: decoded.uid,
        email: decoded.email ?? undefined,
      };

      return true;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Unknown Firebase error';
      throw new UnauthorizedException(`Invalid Firebase token: ${message}`);
    }
  }

  private extractFirebaseToken(request: AuthenticatedRequest): string | null {
    const bodyToken = this.extractBodyToken(request);
    if (bodyToken) return bodyToken;

    return this.extractHeaderToken(request);
  }

  private extractBodyToken(request: AuthenticatedRequest): string | null {
    const body = request.body as Record<string, unknown> | undefined;
    const token = typeof body?.idToken === 'string' ? body.idToken : null;
    return token;
  }

  private extractHeaderToken(request: AuthenticatedRequest): string | null {
    const header = request.headers.authorization;
    if (!header) return null;

    const [scheme, value] = header.split(' ');

    if (scheme?.toLowerCase() !== 'bearer' || !value) {
      return null;
    }

    return value;
  }
}
