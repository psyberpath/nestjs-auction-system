import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auction, AuctionStatus } from '../entities/auction.entity';
import { User } from '../entities/user.entity';
import { CreateAuctionDto } from '../dtos/create-auction.dto';
import { UpdateAuctionDto } from '../dtos/update-auction.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class AuctionsService {
  constructor(
    @InjectRepository(Auction)
    private auctionsRepository: Repository<Auction>,
    private logger: Logger = new Logger('AuctionsService'),
    @InjectQueue('auctions') private auctionQueue: Queue,
  ) {}

  async create(
    createAuctionDto: CreateAuctionDto,
    seller: User,
  ): Promise<Auction> {
    const { title, description, startingPrice, endTime } = createAuctionDto;

    const auction = this.auctionsRepository.create({
      title,
      description,
      startingPrice,
      currentPrice: startingPrice,
      startTime: new Date(),
      endTime: new Date(endTime),
      status: AuctionStatus.ACTIVE,
      seller,
    });

    await this.auctionsRepository.save(auction);

    const delay = new Date(auction.endTime).getTime() - new Date().getTime();
    this.logger.log(
      `Scheduling auction closure job for ${auction.id} in ${delay}ms`,
    );
    await this.auctionQueue.add(
      'close-auction',
      { auctionId: auction.id },
      { delay },
    );

    return auction;
  }

  findAll(): Promise<Auction[]> {
    return this.auctionsRepository.find({
      relations: ['seller'],
      select: {
        seller: {
          id: true,
          username: true,
        },
      },
    });
  }

  async findOne(id: string): Promise<Auction> {
    const auction = await this.auctionsRepository.findOne({
      where: { id },
      relations: ['seller'],
    });
    if (!auction) {
      throw new NotFoundException(`Auction with ID "${id}" not found`);
    }
    return auction;
  }

  async update(
    auction: Auction,
    updateAuctionDto: UpdateAuctionDto,
  ): Promise<Auction> {
    const updatedAuction = this.auctionsRepository.merge(
      auction,
      updateAuctionDto,
    );
    return this.auctionsRepository.save(updatedAuction);
  }

  async remove(id: string): Promise<void> {
    const result = await this.auctionsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Auction with ID "${id}" not found`);
    }
  }
}
