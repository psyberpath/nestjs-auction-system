import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAuctionDto {
  @ApiProperty({ example: 'title-of-auction' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'description-of-item' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'auction-price' })
  @IsNumber()
  @Min(1)
  startingPrice: number;

  @ApiProperty({ example: 'auction-time-up' })
  @IsDateString()
  @IsNotEmpty()
  endTime: Date;
}
