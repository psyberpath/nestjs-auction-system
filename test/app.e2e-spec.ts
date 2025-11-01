// // test/app.e2e-spec.ts
// import { Test, TestingModule } from '@nestjs/testing';
// import { INestApplication, ValidationPipe } from '@nestjs/common';
// import request = require('supertest');
// import { AppModule } from './../src/app.module';

// describe('AppController (e2e)', () => {
//   let app: INestApplication;
//   let httpServer: any; // Store the server instance

//   beforeAll(async () => {
//     const moduleFixture: TestingModule = await Test.createTestingModule({
//       imports: [AppModule],
//     }).compile();

//     app = moduleFixture.createNestApplication();
//     app.useGlobalPipes(new ValidationPipe());
//     await app.init();

//     // Get the server instance once
//     httpServer = app.getHttpServer();
//   });

//   afterAll(async () => {
//     await app.close();
//   });

//   // --- Our New E2E Test Flow (all async/await) ---
//   describe('Auction and Bidding Flow', () => {
//     let userToken: string;
//     let auctionId: string;

//     it('POST /auth/register - should register a new user', async () => {
//       // No 'return', just 'await'
//       await request(httpServer)
//         .post('/auth/register')
//         .send({
//           email: 'e2e@test.com',
//           username: 'e2eUser',
//           password: 'password123',
//         })
//         .expect(201);
//     });

//     it('POST /auth/login - should log in the user', async () => {
//       const res = await request(httpServer)
//         .post('/auth/login')
//         .send({
//           email: 'e2e@test.com',
//           password: 'password123',
//         })
//         .expect(200);

//       expect(res.body).toHaveProperty('accessToken');
//       userToken = res.body.accessToken;
//     });

//     it('POST /auctions - should create a new auction', async () => {
//       const endTime = new Date(Date.now() + 1000 * 60 * 10).toISOString();
//       const res = await request(httpServer)
//         .post('/auctions')
//         .set('Authorization', `Bearer ${userToken}`)
//         .send({
//           title: 'E2E Test Auction',
//           description: 'A test auction',
//           startingPrice: 100,
//           endTime: endTime,
//         })
//         .expect(201);

//       expect(res.body).toHaveProperty('id');
//       expect(res.body.title).toBe('E2E Test Auction');
//       auctionId = res.body.id;
//     });

//     it('POST /bids - should place a bid on the auction', async () => {
//       // Converted from .then() to async/await
//       const res = await request(httpServer)
//         .post('/bids')
//         .set('Authorization', `Bearer ${userToken}`)
//         .send({
//           amount: 110,
//           auctionId: auctionId,
//         })
//         .expect(201);

//       expect(res.body).toHaveProperty('id');
//       expect(res.body.amount).toBe(110);
//     });

//     it('GET /auctions/:id - should reflect the new currentPrice', async () => {
//       // Converted from .then() to async/await
//       const res = await request(httpServer)
//         .get(`/auctions/${auctionId}`)
//         .set('Authorization', `Bearer ${userToken}`)
//         .expect(200);

//       expect(res.body.currentPrice).toBe(110);
//     });
//   });
// });

// import { Test, TestingModule } from '@nestjs/testing';
// import { INestApplication, ValidationPipe } from '@nestjs/common';
// import { Server } from 'http';
// import request from 'supertest';
// import { getRepositoryToken } from '@nestjs/typeorm';
// import { User } from '../src/entities/user.entity';
// import { Repository } from 'typeorm';
// import { AppModule } from './../src/app.module';

// describe('AppController (e2e)', () => {
//   let app: INestApplication;
//   let httpServer: Server;
//   let userRepository: Repository<User>;

//   beforeAll(async () => {
//     const moduleFixture: TestingModule = await Test.createTestingModule({
//       imports: [AppModule],
//     }).compile();

//     app = moduleFixture.createNestApplication();

//     app.useGlobalPipes(
//       new ValidationPipe({
//         whitelist: true,
//         forbidNonWhitelisted: true,
//         transform: true,
//       }),
//     );

//     await app.init();
//     userRepository = moduleFixture.get<Repository<User>>(
//       getRepositoryToken(User),
//     );
//     await userRepository.delete({ email: 'e2e@test.com' });
//     httpServer = app.getHttpServer();
//   });

//   afterAll(async () => {
//     await userRepository.delete({ email: 'e2e@test.com' });
//     await app.close();
//   });

//   // --- E2E Flow ---
//   describe('Auction and Bidding Flow', () => {
//     let userToken: string | undefined;
//     let auctionId: string | undefined;

//     it('POST /auth/register - should register a new user', async () => {
//       await request(httpServer)
//         .post('/auth/register')
//         .send({
//           email: 'e2e@test.com',
//           username: 'e2eUser',
//           password: 'password123',
//         })
//         .expect(201);
//     });

//     it('POST /auth/login - should log in the user', async () => {
//       const res = await request(httpServer)
//         .post('/auth/login')
//         .send({
//           email: 'e2e@test.com',
//           password: 'password123',
//         })
//         .expect(200);

//       expect(res.body).toHaveProperty('accessToken');
//       userToken = res.body.accessToken;
//     });

//     it('POST /auctions - should create a new auction', async () => {
//       if (!userToken) throw new Error('User token not set');

//       const endTime = new Date(Date.now() + 1000 * 60 * 10).toISOString();
//       const res = await request(httpServer)
//         .post('/auctions')
//         .set('Authorization', `Bearer ${userToken}`)
//         .send({
//           title: 'E2E Test Auction',
//           description: 'A test auction',
//           startingPrice: 100,
//           endTime,
//         })
//         .expect(201);

//       expect(res.body).toHaveProperty('id');
//       expect(res.body.title).toBe('E2E Test Auction');
//       auctionId = res.body.id;
//     });

//     it('POST /bids - should place a bid on the auction', async () => {
//       if (!userToken || !auctionId)
//         throw new Error('Required values missing before bid test');

//       const res = await request(httpServer)
//         .post('/bids')
//         .set('Authorization', `Bearer ${userToken}`)
//         .send({
//           amount: 110,
//           auctionId,
//         })
//         .expect(201);

//       expect(res.body).toHaveProperty('id');
//       expect(res.body.amount).toBe(110);
//     });

//     it('GET /auctions/:id - should reflect the new currentPrice', async () => {
//       if (!userToken || !auctionId)
//         throw new Error('Required values missing before get auction test');

//       const res = await request(httpServer)
//         .get(`/auctions/${auctionId}`)
//         .set('Authorization', `Bearer ${userToken}`)
//         .expect(200);

//       expect(res.body.currentPrice).toBe(110);
//     });
//   });
// });

// test/app.e2e-spec.ts
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

  // Store credentials for two different users
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

    // Get all repositories we need
    userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );
    auctionRepository = moduleFixture.get<Repository<Auction>>(
      getRepositoryToken(Auction),
    );
    bidRepository = moduleFixture.get<Repository<Bid>>(getRepositoryToken(Bid));

    // Clean up all test data before tests run
    // await bidRepository.clear();
    // await auctionRepository.clear();
    // Use QueryBuilder to safely delete all records
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
    // Clean up in the correct order: children first
    // await bidRepository.clear();
    // await auctionRepository.clear();
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

  // --- E2E Test Flow ---
  describe('Auction and Bidding Flow', () => {
    // --- SETUP: User A (Seller) ---
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

    // --- SETUP: User B (Bidder) ---
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

    // --- TEST: Auction Creation ---
    it('POST /auctions - (User A) should create a new auction', async () => {
      const endTime = new Date(Date.now() + 1000 * 60 * 10).toISOString();
      const res = await request(app.getHttpServer())
        .post('/auctions')
        .set('Authorization', `Bearer ${userAToken}`) // User A creates
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

    // --- TEST: Bidding ---
    it('POST /bids - (User B) should place a bid on the auction', () => {
      return request(app.getHttpServer())
        .post('/bids')
        .set('Authorization', `Bearer ${userBToken}`) // User B bids
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

    // --- TEST: Verification ---
    it('GET /auctions/:id - should reflect the new currentPrice', () => {
      return request(app.getHttpServer())
        .get(`/auctions/${auctionId}`)
        .set('Authorization', `Bearer ${userAToken}`) // Either user can view
        .expect(200)
        .then((res) => {
          // Check for the string value, not a number
          expect((res.body as { currentPrice: string }).currentPrice).toBe(
            '110.00',
          );
        });
    });
  });
});
