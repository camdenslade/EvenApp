import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { FirestoreService } from '../firebase/firestore.service';

export interface TokenResponse {
  access: string;
  refresh: string;
  isNewUser: boolean;
}

interface FirebaseUserPayload {
  uid: string;
  email: string | undefined;
}

interface RefreshTokenPayload {
  sub: string;
  rid: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly firestore: FirestoreService,
  ) {}

  async createTokens(
    firebaseUser: FirebaseUserPayload,
  ): Promise<TokenResponse> {
    const { uid, email } = firebaseUser;

    const accessPayload = { sub: uid };
    const access = this.jwt.sign(accessPayload, {
      expiresIn: '30m',
      secret: process.env.JWT_ACCESS_SECRET,
    });

    const refreshId = randomUUID();
    const refreshPayload = { sub: uid, rid: refreshId };
    const refresh = this.jwt.sign(refreshPayload, {
      expiresIn: '7d',
      secret: process.env.JWT_REFRESH_SECRET,
    });

    const userRef = this.firestore.collection('users').doc(uid);
    const doc = await userRef.get();

    let isNewUser = false;

    if (!doc.exists) {
      isNewUser = true;
      await userRef.set({
        email,
        createdAt: new Date(),
        updatedAt: new Date(),
        profileComplete: false,
      });
    }

    return { access, refresh, isNewUser };
  }

  refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwt.verify<RefreshTokenPayload>(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const userId = payload.sub;

      if (!userId) {
        throw new UnauthorizedException('Invalid refresh token payload');
      }

      const newAccessToken = this.jwt.sign(
        { sub: userId },
        {
          secret: process.env.JWT_ACCESS_SECRET,
          expiresIn: '30m',
        },
      );

      const refreshId = randomUUID();
      const newRefreshPayload = { sub: userId, rid: refreshId };
      const newRefreshToken = this.jwt.sign(newRefreshPayload, {
        expiresIn: '7d',
        secret: process.env.JWT_REFRESH_SECRET,
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }
}
