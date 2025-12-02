import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  VersionColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Bid } from './bid.entity';
import { BaseEntity } from '../common/base.entity';

export enum AuctionStatus {
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED',
}

@Entity({ name: 'auctions' })
export class Auction extends BaseEntity {
  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  startingPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  currentPrice: number;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({
    type: 'enum',
    enum: AuctionStatus,
    default: AuctionStatus.ACTIVE,
  })
  status: AuctionStatus;

  @Column()
  startTime: Date;

  @Column()
  endTime: Date;

  @VersionColumn()
  version: number;

  @ManyToOne(() => User, (user) => user.auctions, { nullable: false })
  @JoinColumn({ name: 'sellerId' })
  seller: User;

  @Column()
  sellerId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'winnerId' })
  winner: User;

  @Column({ nullable: true })
  winnerId: string;

  @OneToMany(() => Bid, (bid) => bid.auction)
  bids: Bid[];
}
