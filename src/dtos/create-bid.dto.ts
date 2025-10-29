import { IsNumber, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBidDto {
  @ApiProperty({ example: 'auction-price' })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ example: 'auction-id' })
  @IsUUID()
  auctionId: string;
}
