import { AssistantService } from "./../../lib/chat-gpt/assistant/assistant.service";
import { Test, TestingModule } from '@nestjs/testing';
import { GenerateArticle } from "./generate-article.service";
import { GoogleSearch } from './../../lib/puppeteer';
import { WebSearchService } from "./../web-search-service/web-search-service.service";

jest.setTimeout(300000000);
describe('chatgptApi', () => {
  let service: AssistantService;
  let researchModuleService: WebSearchService;
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AssistantService],
    }).compile();

    service = module.get<AssistantService>(AssistantService);

    const researchModule: TestingModule = await Test.createTestingModule({
      providers: [GoogleSearch],
    }).compile();
    
    researchModuleService = researchModule.get<WebSearchService>(GoogleSearch);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('Test scenario', async () => {
    expect(service).toBeDefined();
    expect(researchModuleService).toBeDefined();

    const prompt = `Noel 2024 approche et nos amis les chiens veulent aussi un cadeaux de noel.`;
    const googleSearch = new GoogleSearch();
    const researS = new WebSearchService(googleSearch);
    const itineraryAssistant = new GenerateArticle(service, researS);
    const completeItnerary = await itineraryAssistant.startGenerate(prompt);
    // console.log(completeItnerary);
    console.log('completeItnerary');
  });
});

