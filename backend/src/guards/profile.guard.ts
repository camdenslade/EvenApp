import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { AuthenticatedRequest } from './jwt-auth.guard';

@Injectable()
export class ProfileGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const uid = request.user.uid;

    if (!uid) {
      throw new ForbiddenException('User ID missing.');
    }

    const isComplete = await this.authService.checkProfileCompletion(uid);

    if (!isComplete) {
      throw new ForbiddenException('Profile setup required.');
    }
    return true;
  }
}
