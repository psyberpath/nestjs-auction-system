import { Entity, Column, OneToMany } from 'typeorm';
import { Auction } from './auction.entity';
import { Bid } from './bid.entity';
import { BaseEntity } from '../common/base.entity';

@Entity({ name: 'users' })
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  username: string;

  @Column({ select: false })
  password?: string;

  @OneToMany(() => Auction, (auction) => auction.seller)
  auctions: Auction[];

  @OneToMany(() => Bid, (bid) => bid.bidder)
  bids: Bid[];
}

// User Entity
// User {
//   id: UUID (PK)
//   email: string (unique)
//   username: string (unique)
//   password: string (hashed)
//   createdAt: timestamp
//   updatedAt: timestamp

//   // Relations
//   auctions: Auction[] (one-to-many)
//   bids: Bid[] (one-to-many)
// }
