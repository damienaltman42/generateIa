// chatGptService/chat-gpt/src/app/modules/itinerary/itinerary.service.ts
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Logger } from './../lib/utils';

@Injectable()
export class GenereateContentService {
    constructor(@InjectQueue('itinerary') private itineraryQueue: Queue) {}

    async createArticle(createArticleDto: any): Promise<{status: string}> {
        await this.itineraryQueue.add('generate-itinerary', {
            data: createArticleDto
        });
        Logger.info('Article creation request sent to the queue');
        return { status: 'Article generation in progress' };
    }

    async generateArticle(createArticleDto: any): Promise<{status: string}> {
        await this.itineraryQueue.add('generate-itinerary', {
            data: createArticleDto
        });
        Logger.info('Article generation request sent to the queue');
        return { status: 'Article generation in progress' };
    }
}