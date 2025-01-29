// chatGptService/chat-gpt/src/app/modules/itinerary/itinerary.service.ts
import { Injectable } from '@nestjs/common';
import { constructionArticleType } from '../generate-article/types/article.types';
import { GoogleSearch, GoogleSearchType, Utils } from './../../lib/puppeteer';
import { Logger } from './../../lib/utils';

@Injectable()
export class WebSearchService {

    constructor(private googleSearch: GoogleSearch) { 
        console.log("WebSearchService constructor");
    }
    
    public async makeResearch(constructionArticle: constructionArticleType): Promise<void> {
      try {
        const trame = constructionArticle.trame;
        for (let i = 0; i < trame.trame.sections.length; i++) {
          const section = trame.trame.sections[i];
          const searchKeywords = section.searchKeywords;
          for (let j = 0; j < searchKeywords.keywords.length; j++) {
            if (searchKeywords.keywords[j] === "NONE") {
              continue;
            }
            const searchResult: GoogleSearchType[] = await this.googleSearch.search(searchKeywords.keywords[j]) as GoogleSearchType[];
            if (searchKeywords.result === undefined || !searchKeywords.result) {
              searchKeywords.result = [];
            }
            searchKeywords.result = [...searchKeywords.result, ...searchResult];
            Utils.sleepRandom(3000, 7000);
          }
        }
      } catch (error) {
        Logger.error(error, "Error: makeResearch");
        throw new Error("Error makeResearch: " + error);
      }
    }

    public async scrapWebPageAndResume(url: string,  title: string, savePath: string): Promise<string> {
      try {
        await this.googleSearch.scrapWebPage(url, title, savePath);
      } catch (error) {
        Logger.error(error, "Error: scrapWebPageAndResume");
      }
      return "";
    }
}