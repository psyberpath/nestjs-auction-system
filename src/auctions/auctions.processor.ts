import { Processor, Process } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Auction, AuctionStatus } from '../entities/auction.entity';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';

@Processor('auctions')
export class AuctionProcessor {
  private readonly logger = new Logger(AuctionProcessor.name);
  constructor(
    @InjectRepository(Auction)
    private auctionsRepository: Repository<Auction>,
  ) {}

  @Process('close-auction')
  async handleCloseAuction(job: Job<{ auctionId: string }>) {
    this.logger.log(
      `Processing job ${job.id} for auction ${job.data.auctionId}`,
    );
    const { auctionId } = job.data;
    const auction = await this.auctionsRepository.findOneBy({ id: auctionId });

    if (!auction) {
      this.logger.warn(`Auction ${auctionId} not found for job ${job.id}`);
      return;
    }
    if (auction.status === AuctionStatus.ACTIVE) {
      auction.status = AuctionStatus.CLOSED;
      await this.auctionsRepository.save(auction);
      this.logger.log(`Closed auction ${auctionId}`);
    } else {
      this.logger.log(`Auction ${auctionId} was already processed`);
    }
  }
}
