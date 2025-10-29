import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { BidsService } from './bids.service';
import { CreateBidDto } from '../dtos/create-bid.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../entities/user.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Bids')
@Controller('bids')
@UseGuards(AuthGuard())
export class BidsController {
  constructor(private readonly bidsService: BidsService) {}

  @Post()
  create(@Body() createBidDto: CreateBidDto, @GetUser() bidder: User) {
    return this.bidsService.create(createBidDto, bidder);
  }
}
