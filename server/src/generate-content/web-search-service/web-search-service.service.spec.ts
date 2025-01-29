import { Test, TestingModule } from '@nestjs/testing';
import { WebSearchService } from './web-search-service.service';

describe('WebSearchService', () => {
  let service: WebSearchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WebSearchService],
    }).compile();

    service = module.get<WebSearchService>(WebSearchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
