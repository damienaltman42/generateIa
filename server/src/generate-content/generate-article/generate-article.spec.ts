import { AssistantService } from "./../../lib/chat-gpt/assistant/assistant.service";
import { Test, TestingModule } from '@nestjs/testing';
import { GenerateArticle } from "./generate-article.service";
import { GoogleSearch } from './../../lib/puppeteer';
import { WebSearchService } from "./../web-search-service/web-search-service.service";
import { BotService } from "src/bots/bot.service";
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bot } from "src/bots/bot.entity";

jest.setTimeout(300000000);

describe('chatgptApi', () => {
  let service: AssistantService;
  let researchModuleService: WebSearchService;
  let botService: BotService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'mysql',
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '3306', 10),
          username: process.env.DB_USERNAME || 'root',
          password: process.env.DB_PASSWORD || '',
          database: process.env.DB_DATABASE || 'test_db',
          entities: [Bot],
          synchronize: false, // Désactive la création automatique pour éviter d'altérer la base réelle
        }),
        TypeOrmModule.forFeature([Bot]),
      ],
      providers: [AssistantService, BotService, GoogleSearch, WebSearchService],
    }).compile();

    service = module.get<AssistantService>(AssistantService);
    researchModuleService = module.get<WebSearchService>(WebSearchService);
    botService = module.get<BotService>(BotService);
  });

  afterAll(async () => {
    // Fermer les connexions à la base de données après les tests
    const connection = botService['connection'];
    if (connection && connection.isConnected) {
      await connection.close();
    }
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(researchModuleService).toBeDefined();
    expect(botService).toBeDefined();
  });

  it('Test scenario', async () => {
    expect(service).toBeDefined();
    expect(researchModuleService).toBeDefined();

    const prompt = `Noel 2024 approche et nos amis les chiens veulent aussi un cadeaux de noel.`;
    const googleSearch = new GoogleSearch(botService);
    const researS = new WebSearchService(googleSearch, botService);
    const itineraryAssistant = new GenerateArticle(service, researS);
    const completeItinerary = await itineraryAssistant.startGenerate(prompt);
    console.log('completeItinerary', completeItinerary);
  });
});