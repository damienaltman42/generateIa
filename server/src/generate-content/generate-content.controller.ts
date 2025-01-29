// chatGptService/chat-gpt/src/app/modules/itinerary/itinerary.controller.ts

import { Body, Controller, Post } from '@nestjs/common';
import { GenereateContentService } from './generate-content.service';
import { Logger } from './../lib/utils';

@Controller('itinerary')
export class GenerateContentController {
    constructor(private readonly itineraryService: GenereateContentService) {}

    @Post()
    create(@Body() createArticleDto: any) {
        Logger.info('Creating itinerary COntroller');
        return this.itineraryService.createArticle(createArticleDto);
    }

    @Post('generate/assistant')
    createAssistant(@Body() createArticleDto: any) {
        Logger.info('Generating itinerary COntroller');
        return this.itineraryService.generateArticle(createArticleDto);
    }
}