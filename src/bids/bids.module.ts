import { Module, Logger } from '@nestjs/common';
import { Bid } from '../entities/bid.entity';
import { BidsService } from './bids.service';
import { BidsController } from './bids.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuctionsModule } from '../auctions/auctions.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Bid]), AuctionsModule, AuthModule],
  controllers: [BidsController],
  providers: [BidsService, Logger],
})
export class BidsModule {}
