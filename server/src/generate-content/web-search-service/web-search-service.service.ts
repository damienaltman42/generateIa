// chatGptService/chat-gpt/src/app/modules/itinerary/itinerary.service.ts
import { Injectable } from '@nestjs/common';
import { constructionArticleType } from '../generate-article/types/article.types';
import { GoogleSearch, GoogleSearchType, Utils } from './../../lib/puppeteer';
import { Logger } from './../../lib/utils';
import { BotService } from 'src/bots/bot.service';

@Injectable()
export class WebSearchService {

    constructor(private googleSearch: GoogleSearch, private botService: BotService) { 
        console.log("WebSearchService constructor");
    }
    
    public async makeResearch(constructionArticle: constructionArticleType): Promise<void> {
      try {
          const trame = constructionArticle.trame;
          for (let i = 0; i < trame.trame.sections.length; i++) {
              const section = trame.trame.sections[i];
              const searchKeywords = section.searchKeywords;
  
              const MAX_CONCURRENT = 5; // Limite des processus simultanés
              const queue: Promise<GoogleSearchType[]>[] = []; // File d'attente des Promises
  
              for (let j = 0; j < searchKeywords.keywords.length; j++) {
                  if (searchKeywords.keywords[j] === "NONE") {
                      continue;
                  }
  
                  // Démarrer le processus avec gestion des erreurs
                  const searchPromise = (async () => {
                      try {
                          const googleSearch = new GoogleSearch(this.botService);
                          const resp =  await googleSearch.search(searchKeywords, searchKeywords.keywords[j]);
                          Logger.info(`Scrap de la recherche pour le mot-clé "${searchKeywords.keywords[j]}" terminé.`);
                          return resp;
                      } catch (error) {
                          Logger.error(
                              `Erreur lors de la recherche pour le mot-clé "${searchKeywords.keywords[j]}": ${error.message}`,
                              "Error: googleSearch.search"
                          );
                          return null; // Retourne null ou une valeur par défaut en cas d'erreur
                      }
                  })();
  
                  // Ajouter à la file d'attente
                  queue.push(searchPromise);
  
                  // Si on atteint la limite, attendre qu'une Promise se termine
                  if (queue.length >= MAX_CONCURRENT) {
                      await Promise.race(queue); // Attend que l'une des Promises se termine
                      queue.splice(queue.findIndex((p) => p === searchPromise), 1); // Nettoie la file
                  }
              }
  
              // Attendre que toutes les Promises restantes soient terminées
              await Promise.all(queue);
          }
  
          try {
              console.log("Attente de la fin des recherches...");
              await this.waitUntilSearchIsFinished(constructionArticle);
          } catch (error) {
              console.error("Erreur lors de la vérification des recherches :", error.message);
              throw new Error("Erreur lors de la vérification des recherches : " + error.message);
          }
      } catch (error) {
          Logger.error(error, "Error: makeResearch");
          throw new Error("Error makeResearch: " + error);
      }
  }


    public async waitUntilSearchIsFinished(constructionArticle: constructionArticleType): Promise<boolean> {
      const MAX_WAIT_TIME = 10 * 60 * 1000; // 10 minutes en millisecondes
      const CHECK_INTERVAL = 500; // Intervalle de vérification en millisecondes
    
      const startTime = Date.now();

      return new Promise((resolve, reject) => {
          const checkStatus = (): boolean => {
              const trame = constructionArticle.trame;
    
              for (const section of trame.trame.sections) {
                  const searchKeywords = section.searchKeywords;
                  
                  for (const keyword of searchKeywords.keywords) {
                      if (keyword === "NONE") continue;
                      if (!searchKeywords.searchFinished || !searchKeywords.searchFinished.includes(keyword)) {
                          console.log("Le mot-clé n'est pas terminé :", keyword);
                          return false;
                      }
                  }
              }
              return true; // Toutes les recherches sont terminées
          };
  
          const checkLoop = async () => {
              while (true) {
                  if (checkStatus()) {
                      Logger.info("Toutes les recherches sont terminées.");
                      resolve(true);
                      break;
                  }
                  if (Date.now() - startTime > MAX_WAIT_TIME) {
                      console.log("Temps d'attente maximum atteint. Certaines recherches ne sont pas terminées.");
                      reject(new Error("Timeout: Les recherches n'ont pas été terminées dans le délai imparti."));
                      break;
                  }
                  await new Promise((r) => setTimeout(r, CHECK_INTERVAL)); // Pause avant la prochaine vérification
              }
          };
  
          checkLoop(); // Appeler la boucle de vérification
      });
  }

    public async scrapWebSite(url: string,  title: string, savePath: string): Promise<string> {
      try {
        const webSiteScrap = await this.googleSearch.scrapWebPage(url, title, savePath);
        return webSiteScrap;
      } catch (error) {
        Logger.error(error, "Error: scrapWebSite");
      }
      return "";
    }
}