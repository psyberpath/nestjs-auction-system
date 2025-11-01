import { Module, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Auction } from '../entities/auction.entity';
import { AuctionsController } from './auctions.controller';
import { AuctionsService } from './auctions.service';
import { AuctionsGateway } from './auctions/auctions.gateway';
import { AuctionOwnerGuard } from '../guards/auction-owner.guard';
import { BullModule } from '@nestjs/bullmq';
import { AuctionProcessor } from './auctions.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([Auction]),
    BullModule.registerQueue({
      name: 'auctions',
    }),
    AuthModule,
  ],
  controllers: [AuctionsController],
  providers: [
    AuctionsService,
    AuctionsGateway,
    Logger,
    AuctionOwnerGuard,
    AuctionProcessor,
  ],
  exports: [AuctionsGateway],
})
export class AuctionsModule {}
