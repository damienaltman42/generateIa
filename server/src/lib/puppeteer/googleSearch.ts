// SC7lYd
import { Browser, Page } from "puppeteer";
import { BrowserLib } from "./browserLib";
import { Utils } from "./utils";
import TurndownService from 'turndown';
import cheerio = require('cheerio');
import { getbasePath, Logger } from "./../utils";
import * as path from 'path';
import * as readline from 'readline';
import { searchKeywordsType } from "src/generate-content/generate-article/types/article.types";
import { link } from "fs";
import { Bot } from "src/bots/bot.entity";
import { BotService } from "src/bots/bot.service";


export enum GOOGLE_SEARCH_RESULT_ENUM {
    SEARCH_BAR = 'textarea[class="gLFyf"]',
    RESULTS = 'div[jscontroller="SC7lYd"]',
    TITLE_RESULT = 'h3[class="LC20lb MBeuO DKV0Md"]',
    DESCRIPTION_RESULT = 'div[class="VwiC3b yXK7lf p4wth r025kc hJNv6b Hdw6tb"]',
    DESCRIPTION_RESULT_2 = 'div[class="VwiC3b yXK7lf lVm3ye r025kc hJNv6b Hdw6tb"]',
    DESCRIPTION_RESULT_GLOBAL = 'div[class*="VwiC3b yXK7lf"]',
    LINK_RESULT = 'a[jsname="UWckNb"]'

}

export type resumeType = {
    resume: string;
    article: {
        title: string;
        url: string;
        description: string;
        image: string;
    }
}

export type GoogleSearchType = {
    title: string;
    link: string;
    description: string;
    webPage: string;
    relevance: boolean;
    revelanceJustification: string;
    resume?: string;
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

export class GoogleSearch {
    public browserLib: BrowserLib;
    public browser: Browser;
    private page: Page;

    constructor(private botService: BotService) {
        Logger.info("GoogleSearch constructor");
    }
    
    public async search(searchKeywords: searchKeywordsType, query: string): Promise<GoogleSearchType[]> {
        let bot = null;
         // Attente d'un bot libre avec gestion des verrous
        try {
            while (!bot) {
                bot = await this.botService.getAndLockFreeBot();
                if (!bot) {
                    // Logger.info('Aucun bot libre disponible. Attente...');
                    await new Promise((resolve) => setTimeout(resolve, 2000)); // Pause avant réessai
                }
            }

            Logger.info(`Bot verrouillé : ${bot.name}`);
            this.browserLib = await BrowserLib.build(bot.config, false);
            this.browser = this.browserLib.browser;
            this.page = await this.browser.newPage();
            await this.browserLib.fixDetectBot(this.page);
            await this.browserLib.loadCookies(this.page, "https://www.google.com", 'cookies/google_cookies.json');
            await this.page.goto('https://www.google.com');
            await this.page.waitForSelector(GOOGLE_SEARCH_RESULT_ENUM.SEARCH_BAR);
            Logger.info('Recherche de :', query);
            await this.page.type(GOOGLE_SEARCH_RESULT_ENUM.SEARCH_BAR, query);
            await Utils.sleepRandom(400, 1000);
            await this.page.keyboard.press('Enter');
            await this.page.waitForSelector(GOOGLE_SEARCH_RESULT_ENUM.RESULTS);
            const results = await this.page.$$(GOOGLE_SEARCH_RESULT_ENUM.RESULTS);
            const data = [];
            let i = 0;
            for (const result of results) {
                const titleEl = await result.$(GOOGLE_SEARCH_RESULT_ENUM.TITLE_RESULT);
                let title = "";
                if (titleEl) {
                    title = await this.page.evaluate((el) => el.textContent, titleEl);
                } else {
                    await this.waitForContinue("==========> 1");
                }
                Logger.info('titleEl:', title);

                const linkEl = await result.$(GOOGLE_SEARCH_RESULT_ENUM.LINK_RESULT);
                let link = "";
                if (linkEl) {
                    link = await this.page.evaluate((el) => el.href, linkEl);
                } else {
                    await this.waitForContinue("==========> 2");
                }
                
                Logger.info('link:', link);

                const descriptionEl = await result.$(GOOGLE_SEARCH_RESULT_ENUM.DESCRIPTION_RESULT_GLOBAL);
                // const descriptionEl1 = await result.$(GOOGLE_SEARCH_RESULT_ENUM.DESCRIPTION_RESULT_2);
                let description = "";
                if (descriptionEl) {
                    description = await this.page.evaluate((el) => el.textContent, descriptionEl);
                } else {
                    Logger.info(title);
                    Logger.info(link);
                    await this.waitForContinue("==========> 3");
                }
                Logger.info('descriptionEl:', description);
                data.push({ title, link, description, search: query });
                if (i === results.length - 1 && link !== "No link") {
                    await Utils.humanClick(this.page, linkEl);
                    await Utils.sleepRandom(1000, 1500);
                }
                i++;
                if (i === 5) {
                    await Utils.humanClick(this.page, linkEl);
                    await Utils.sleepRandom(1000, 1500);
                    break;
                }
            }
            await this.browserLib.close('cookies/google_cookies.json');
            if (searchKeywords.result === undefined || !searchKeywords.result) {
                searchKeywords.result = [];
            }
            searchKeywords.result = [...searchKeywords.result, ...data];
            if (searchKeywords.searchFinished === undefined || !searchKeywords.searchFinished) {
                searchKeywords.searchFinished = [];
            }
            searchKeywords.searchFinished.push(query);
            return data;
        } catch (error) {
            try {
                await this.browserLib.close('cookies/google_cookies.json');
            } catch (errorBis) {
                Logger.error('Erreur pendant la fermeture :', errorBis);
            }
            if (searchKeywords.searchFinished === undefined || !searchKeywords.searchFinished) {
                searchKeywords.searchFinished = [];
            }
            searchKeywords.searchFinished.push(query);
            Logger.error(`Erreur pendant la recherche : ${bot.name}`, error);
            throw error;
        } finally {
            if (bot) {
                Logger.info(`Libération du bot : ${bot.name}`);
                await this.botService.releaseBot(bot); // Libérer le bot après utilisation
            }
        }
    }

    public async scrapWebPage(url: string, title: string, savePath: string = null): Promise<string> {
        let bot = null;
        // Attente d'un bot libre avec gestion des verrous
       try {
           while (!bot) {
               bot = await this.botService.getAndLockFreeBot();
               if (!bot) {
                   await new Promise((resolve) => setTimeout(resolve, 2000)); // Pause avant réessai
               }
            }
            if (this.browserLib === undefined) {
                this.browserLib = await BrowserLib.build(bot.config, false);
            }
            if (this.browser === undefined) {
                this.browser = this.browserLib.browser;
            }
            if (this.page === undefined) {
                this.page = await this.browser.newPage();
            }
            // Charger l'URL
            await this.page.goto(url);
            await Utils.sleepRandom(2000, 5000);
        
            const rawHtml = await this.page.evaluate(() => document.body.innerHTML);
        
            // Charger le HTML avec Cheerio
            const $ = cheerio.load(rawHtml);

            // Supprimer les balises inutiles
            $('script, figure, figcaption, style, iframe, noscript, link, meta, embed, object, header, footer, nav, aside, form, ad, ins, video, audio, canvas, svg, button, input, textarea, select').remove();
            $('*[class], *[id], *[style]').removeAttr('class id style'); // Supprime les attributs inutiles

            // Obtenir le HTML nettoyé
            const cleanedHtml = $.html();


            // Convertir le HTML en Markdown
            const turndownService = new TurndownService();
            const markdown = turndownService.turndown(cleanedHtml) as string;
            const basePath = getbasePath('shared/googleSearch');
            if (savePath) {
                await Utils.writeFileSyncJson(path.join(basePath, `${title}.txt`), (url + " \n " + markdown));
            } else {
                await Utils.writeFileSyncJson(path.join(savePath, `${title}.txt`), (url + " \n " + markdown));
            }
            await this.browserLib.close('cookies/google_cookies.json');
            return markdown;
        } catch (error) {
            Logger.error('Erreur pendant la recherche :', error);
            throw error;
        } finally {
            if (bot) {
                Logger.info(`Libération du bot : ${bot.name}`);
                await this.botService.releaseBot(bot); // Libérer le bot après utilisation
            }
        }
    }

// For debug chrome
  async waitForContinue(message = ""): Promise<void> {
    return new Promise((resolve) => {
      rl.question(`
        ${message}
        Tapez "continue" pour continuer : `, (input) => {
        if (input.trim() === 'continue') {
          resolve();
        } else {
          Logger.info('Commande incorrecte. Réessayez.');
          this.waitForContinue().then(resolve); // Répète l'attente
        }
      });
    });
  }
}