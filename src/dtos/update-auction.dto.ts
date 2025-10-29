import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAuctionDto {
  @ApiProperty({ example: 'auction-title' })
  @IsString()
  @IsOptional()
  title: string;

  @ApiProperty({ example: 'auction-description' })
  @IsString()
  @IsOptional()
  description: string;
}
