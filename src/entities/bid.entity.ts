import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Auction } from './auction.entity';
import { User } from './user.entity';
import { BaseEntity } from '../common/base.entity';

@Entity({ name: 'bids' })
@Index(['auctionId', 'createdAt'])
export class Bid extends BaseEntity {
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @ManyToOne(() => Auction, (auction) => auction.bids, { nullable: false })
  @JoinColumn({ name: 'auctionId' })
  auction: Auction;

  @Column()
  auctionId: string;

  @ManyToOne(() => User, (user) => user.bids, { nullable: false })
  @JoinColumn({ name: 'bidderId' })
  bidder: User;

  @Column()
  bidderId: string;
}
