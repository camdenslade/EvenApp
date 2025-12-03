import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export interface FirebaseAuthedUser {
  uid: string;
  email: string | null;
}

export const FirebaseUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): FirebaseAuthedUser | undefined => {
    const req = ctx.switchToHttp().getRequest<Request>();
    return req.user;
  },
);
