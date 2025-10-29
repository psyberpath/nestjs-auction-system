import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../entities/user.entity';
import { AuctionsService } from './auctions.service';
import { CreateAuctionDto } from '../dtos/create-auction.dto';
import { UpdateAuctionDto } from '../dtos/update-auction.dto';
import { AuctionOwnerGuard } from '../guards/auction-owner.guard';
import { Auction } from '../entities/auction.entity';
import { GetAuction } from './get-auction.decorator';
import { CacheInterceptor, CacheKey } from '@nestjs/cache-manager';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auctions')
@Controller('auctions')
@UseGuards(AuthGuard())
export class AuctionsController {
  constructor(
    private readonly auctionsService: AuctionsService,
    private logger: Logger = new Logger('AuctionsController'),
  ) {}

  @Post()
  create(@Body() createAuctionDto: CreateAuctionDto, @GetUser() seller: User) {
    return this.auctionsService.create(createAuctionDto, seller);
  }

  @Get()
  findAll() {
    return this.auctionsService.findAll();
  }

  @UseInterceptors(CacheInterceptor)
  @CacheKey('get_auction_by_id')
  @Get(':id')
  findOne(@Param('id') id: string) {
    this.logger.log('Fetching from DB...');
    return this.auctionsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuctionOwnerGuard)
  update(
    @GetAuction() auction: Auction,
    @Body() updateAuctionDto: UpdateAuctionDto,
  ) {
    return this.auctionsService.update(auction, updateAuctionDto);
  }

  @Delete(':id')
  @UseGuards(AuctionOwnerGuard)
  remove(@Param('id') id: string) {
    return this.auctionsService.remove(id);
  }
}
