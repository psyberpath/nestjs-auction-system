import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User as UserEntity } from '../entities/user.entity';
import { Request } from 'express';

export const GetUser = createParamDecorator(
  (_data, ctx: ExecutionContext): UserEntity => {
    const req: Request = ctx.switchToHttp().getRequest();
    return req.user as UserEntity;
  },
);
