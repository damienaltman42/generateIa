import { BullModule } from '@nestjs/bull';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { GenerateContentController } from './generate-content.controller';
import { GenerateContentProcessor } from './generate-content.processor';
import { GenereateContentService } from './generate-content.service';
import { WebSearchService } from './web-search-service/web-search-service.service';
// import { GenerateArticleModule } from '@chatgpt-api/src/lib/generate-article/generate-article.module';
// import { FindImageArticleModule } from '@chatgpt-api/src/lib/findImage/find-image-article.module';
import { AssistantModule } from './../lib/chat-gpt/assistant/assistant.module';
// import { SeoArticleOptimizationModule } from '@chatgpt-api/src/lib/seo-article-optimization/seo-article-optimization.module';
// import * as dotenv from 'dotenv';
// import { EmbedHtmlModule, SeoArticleModule, TranslateAssistantModule } from '@chatgpt-api/src';
// import { getbasePath } from '@chatgpt-api/utils';
// import { ArticleAssistant } from './article-assistant/article-assistant';

// dotenv.config({path: getbasePath('.env')});
import { BotModule } from 'src/bots/bot.module'; 

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT, 10) || 6379,
        password: process.env.REDIS_PASSWORD || '',
      },
    }),
    BullModule.registerQueue({
      name: 'itinerary',
    }),
    HttpModule,
    // FindImageArticleModule,
    // GenerateArticleModule,
    AssistantModule,
    BotModule
    // SeoArticleOptimizationModule,
    // EmbedHtmlModule,
    // SeoArticleModule,
    // TranslateAssistantModule
  ],
  controllers: [GenerateContentController],
  providers: [
    // ArticleAssistant,
    GenerateContentProcessor,
    GenereateContentService,
    WebSearchService
  ],
  exports: [GenereateContentService]
})
export class ArticleModule {}
