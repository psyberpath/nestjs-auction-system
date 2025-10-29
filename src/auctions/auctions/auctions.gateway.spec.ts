import { Test, TestingModule } from '@nestjs/testing';
import { AuctionsGateway } from './auctions.gateway';

describe('AuctionsGateway', () => {
  let gateway: AuctionsGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuctionsGateway],
    }).compile();

    gateway = module.get<AuctionsGateway>(AuctionsGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
