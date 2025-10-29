import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Auction } from '../entities/auction.entity';
import { Request } from 'express';

export const GetAuction = createParamDecorator(
  (_data, ctx: ExecutionContext): Auction => {
    const req: Request = ctx.switchToHttp().getRequest();
    return req.auction!;
  },
);
