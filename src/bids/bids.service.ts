import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CreateBidDto } from '../dtos/create-bid.dto';
import { Bid } from '../entities/bid.entity';
import { Auction, AuctionStatus } from '../entities/auction.entity';
import { User } from '../entities/user.entity';
import { AuctionsGateway } from '../auctions/auctions/auctions.gateway';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class BidsService {
  constructor(
    @InjectRepository(Bid)
    private bidsRepository: Repository<Bid>,
    private dataSource: DataSource,
    private auctionsGateway: AuctionsGateway,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private logger: Logger = new Logger('BidsService'),
  ) {}

  async create(createBidDto: CreateBidDto, bidder: User): Promise<Bid> {
    const { amount, auctionId } = createBidDto;
    return this.dataSource.transaction(async (transactionalEntityManager) => {
      const auction = await transactionalEntityManager
        .createQueryBuilder(Auction, 'auction')
        .setLock('pessimistic_write')
        .where('auction.id = :id', { id: auctionId })
        .getOne();

      if (!auction) {
        throw new NotFoundException(`Auction with ID ${auctionId} not found`);
      }
      if (auction.status !== AuctionStatus.ACTIVE) {
        throw new BadRequestException('You can only bid on active auctions');
      }
      if (new Date() > auction.endTime) {
        throw new BadRequestException('This auction has ended');
      }
      if (bidder.id === auction.sellerId) {
        throw new ForbiddenException('You cannot bid on your own auction');
      }
      if (amount <= auction.currentPrice) {
        throw new BadRequestException(
          `Your bid must be higher than the current price of $${auction.currentPrice}`,
        );
      }

      const newBid = transactionalEntityManager.create(Bid, {
        amount,
        auction,
        bidder,
      });
      await transactionalEntityManager.save(newBid);

      auction.currentPrice = amount;
      auction.winner = bidder;
      await transactionalEntityManager.save(auction);

      const cacheKey = `get_auction_by_id${auctionId}`;
      this.logger.log(`Invalidating cache: ${cacheKey}`);
      await this.cacheManager.del(cacheKey);

      this.auctionsGateway.broadcastNewBid(auction.id, {
        amount: newBid.amount,
        bidderName: bidder.username,
        timestamp: newBid.createdAt,
      });

      return newBid;
    });
  }
}
