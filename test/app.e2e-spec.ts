// test/app.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request = require('supertest');
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let httpServer: any; // Store the server instance

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Get the server instance once
    httpServer = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  // --- Our New E2E Test Flow (all async/await) ---
  describe('Auction and Bidding Flow', () => {
    let userToken: string;
    let auctionId: string;

    it('POST /auth/register - should register a new user', async () => {
      // No 'return', just 'await'
      await request(httpServer)
        .post('/auth/register')
        .send({
          email: 'e2e@test.com',
          username: 'e2eUser',
          password: 'password123',
        })
        .expect(201);
    });

    it('POST /auth/login - should log in the user', async () => {
      const res = await request(httpServer)
        .post('/auth/login')
        .send({
          email: 'e2e@test.com',
          password: 'password123',
        })
        .expect(200);

      expect(res.body).toHaveProperty('accessToken');
      userToken = res.body.accessToken;
    });

    it('POST /auctions - should create a new auction', async () => {
      const endTime = new Date(Date.now() + 1000 * 60 * 10).toISOString();
      const res = await request(httpServer)
        .post('/auctions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'E2E Test Auction',
          description: 'A test auction',
          startingPrice: 100,
          endTime: endTime,
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toBe('E2E Test Auction');
      auctionId = res.body.id;
    });

    it('POST /bids - should place a bid on the auction', async () => {
      // Converted from .then() to async/await
      const res = await request(httpServer)
        .post('/bids')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          amount: 110,
          auctionId: auctionId,
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.amount).toBe(110);
    });

    it('GET /auctions/:id - should reflect the new currentPrice', async () => {
      // Converted from .then() to async/await
      const res = await request(httpServer)
        .get(`/auctions/${auctionId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(res.body.currentPrice).toBe(110);
    });
  });
});
