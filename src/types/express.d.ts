import { User as UserEntity } from '../entities/user.entity';
import { Auction } from '../entities/auction.entity';

declare global {
  namespace Express {
    export interface Request {
      user?: UserEntity;
      auction?: Auction;
    }
  }
}
