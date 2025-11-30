import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { FirebaseAuthGuard } from '../guards/firebase-auth.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { FirebaseModule } from '../firebase/firebase.module';

@Module({
  imports: [
    FirebaseModule,
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET,
      signOptions: { expiresIn: '30m' },
    }),
  ],
  providers: [AuthService, FirebaseAuthGuard, JwtAuthGuard],
  controllers: [AuthController],
  exports: [AuthService, FirebaseAuthGuard, JwtAuthGuard, JwtModule],
})
export class AuthModule {}
