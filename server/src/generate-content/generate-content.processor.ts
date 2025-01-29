// chatGptService/chat-gpt/src/app/modules/itinerary/itinerary.processor.ts
import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { HttpService } from '@nestjs/axios';
// import { SeoArticleOptimizationService } from '@chatgpt-api/src/lib/seo-article-optimization/seo-article-optimization.service';
// import { TranslateAssistantService } from '@chatgpt-api/src';

@Processor('itinerary')
export class GenerateContentProcessor {

    constructor(
        private httpService: HttpService,
        // private seoArticleOptimizationService: SeoArticleOptimizationService,
        // private translateAssistantService: TranslateAssistantService
    ) {}

    @Process('generate-itinerary')
    async handleGenerateArticle(job: Job<{data: any}>) {
      // Logger.info('Generating itinerary');
    }
}
