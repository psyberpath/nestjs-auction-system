import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { AuctionsService } from '../auctions/auctions.service';
import { Request } from 'express';
import { User } from '../entities/user.entity';

@Injectable()
export class AuctionOwnerGuard implements CanActivate {
  constructor(private readonly auctionsService: AuctionsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const user = request.user as User;
    const auctionId: string = request.params.id;
    if (!user || !auctionId) return false;
    const auction = await this.auctionsService.findOne(auctionId);
    if (!auction) {
      throw new NotFoundException(`Auction with ID "${auctionId} not found`);
    }
    if (auction.sellerId !== user.id) {
      throw new UnauthorizedException('You are not the owner of this auction');
    }
    request.auction = auction;
    return true;
  }
}
