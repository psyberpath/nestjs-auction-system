import 'dotenv/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from '../entities/user.entity';
import { Auction } from '../entities/auction.entity';
import { Bid } from '../entities/bid.entity';

function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable ${key}`);
  }
  return value;
}

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: getEnv('DB_HOST'),
  port: parseInt(getEnv('DB_PORT'), 10),
  username: getEnv('DB_USERNAME'),
  password: getEnv('DB_PASSWORD'),
  database: getEnv('DB_DATABASE'),
  entities: [User, Auction, Bid],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
