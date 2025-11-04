import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './../src/entities/user.entity';
import { Auction } from './../src/entities/auction.entity';
import { Bid } from './../src/entities/bid.entity';
import { Repository } from 'typeorm';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let auctionRepository: Repository<Auction>;
  let bidRepository: Repository<Bid>;

  const userA = {
    email: 'userA@test.com',
    username: 'userA',
    password: 'password123',
  };
  const userB = {
    email: 'userB@test.com',
    username: 'userB',
    password: 'password123',
  };

  let userAToken: string;
  let userBToken: string;
  let auctionId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );
    auctionRepository = moduleFixture.get<Repository<Auction>>(
      getRepositoryToken(Auction),
    );
    bidRepository = moduleFixture.get<Repository<Bid>>(getRepositoryToken(Bid));

    await bidRepository.createQueryBuilder().delete().from(Bid).execute();
    await auctionRepository
      .createQueryBuilder()
      .delete()
      .from(Auction)
      .execute();
    await userRepository.delete({ email: userA.email });
    await userRepository.delete({ email: userB.email });
  });

  afterAll(async () => {
    await bidRepository.createQueryBuilder().delete().from(Bid).execute();
    await auctionRepository
      .createQueryBuilder()
      .delete()
      .from(Auction)
      .execute();
    await userRepository.delete({ email: userA.email });
    await userRepository.delete({ email: userB.email });
    await app.close();
  });

  describe('Auction and Bidding Flow', () => {
    it('POST /auth/register - (User A) should register seller', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(userA)
        .expect(201);
    });

    it('POST /auth/login - (User A) should log in seller', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: userA.email, password: userA.password })
        .expect(200);

      expect(res.body).toHaveProperty('accessToken');
      userAToken = (res.body as { accessToken: string }).accessToken;
    });

    it('POST /auth/register - (User B) should register bidder', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(userB)
        .expect(201);
    });

    it('POST /auth/login - (User B) should log in bidder', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: userB.email, password: userB.password })
        .expect(200);

      expect(res.body).toHaveProperty('accessToken');
      userBToken = (res.body as { accessToken: string }).accessToken;
    });

    it('POST /auctions - (User A) should create a new auction', async () => {
      const endTime = new Date(Date.now() + 1000 * 60 * 10).toISOString();
      const res = await request(app.getHttpServer())
        .post('/auctions')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          title: 'E2E Test Auction',
          description: 'A test auction',
          startingPrice: 100,
          endTime: endTime,
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect((res.body as { title: string }).title).toBe('E2E Test Auction');
      auctionId = (res.body as { id: string }).id;
    });

    it('POST /bids - (User B) should place a bid on the auction', () => {
      return request(app.getHttpServer())
        .post('/bids')
        .set('Authorization', `Bearer ${userBToken}`)
        .send({
          amount: 110,
          auctionId: auctionId,
        })
        .expect(201)
        .then((res) => {
          expect(res.body).toHaveProperty('id');
          expect((res.body as { amount: number }).amount).toBe(110);
        });
    });

    it('GET /auctions/:id - should reflect the new currentPrice', () => {
      return request(app.getHttpServer())
        .get(`/auctions/${auctionId}`)
        .set('Authorization', `Bearer ${userAToken}`)
        .expect(200)
        .then((res) => {
          expect((res.body as { currentPrice: string }).currentPrice).toBe(
            '110.00',
          );
        });
    });
  });
});
