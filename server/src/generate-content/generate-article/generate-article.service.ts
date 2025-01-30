import OpenAI from "openai";
import { RunCreateParams } from "openai/resources/beta/threads/runs/runs";

import { AssistantService, AssistantBase } from "../../lib/chat-gpt/assistant";
import { getbasePath, Logger, randomChance, sleepFct } from "../../lib/utils";
import * as path from 'path';
import { randomInt } from "crypto";
import { Injectable } from "@nestjs/common";

import * as fs from 'fs';
import { step1, step2, step3, step4, step5, step6 } from "./prompts";
import { Utils } from "../../lib/puppeteer/utils";
import { constructionArticleType } from "./types/article.types";
import { WebSearchService } from "../web-search-service/web-search-service.service";
import { evaluateSearch } from "./prompts/thoughtTree/evaluateSearch";
import { resumeWebSite } from "./prompts/thoughtTree/resumeWebSite";

const basePath = getbasePath('shared/articles');
// const testAssisant = "asst_z80PbGerFo0zJ0372Y0MDid6"

interface FunctionArgsMap  {
    undefined: undefined;
}

@Injectable()
export class GenerateArticle extends AssistantBase<FunctionArgsMap>  {
  
  protected getFunctionToCall<K extends "undefined">(functionName: K): (args: FunctionArgsMap[K]) => Promise<string> {
    throw new Error("Method not implemented.");
  }
  
  public assistantId = "asst_KhV2X9NoxRqC0p3aNOBbXLZO";
  public thread: OpenAI.Beta.Threads.Thread;
  public article = "";
  public constructionArticle: constructionArticleType;

  constructor(
    assistantService: AssistantService,
    private WebSearchService: WebSearchService,
  ) {
    super(assistantService);
    this.constructionArticle = {} as unknown as constructionArticleType;
  }

  public  getConstructionArticle(): constructionArticleType {
    return this.constructionArticle;
  }

  public async startGenerate(prompt: string): Promise<string> {
    try {
      Logger.info("Start generate");
      this.constructionArticle = {
        title: "",
        trame: null,
        basePath: "",
        mainThreadId: "",
        nbSections: 0
      };
      this.constructionArticle = Utils.readFileSyncJson(path.join("/Users/damienaltman/Desktop/projet_perso/generateIa/server/shared/articles/02", "articleMetaDatas.json")) as constructionArticleType;
      console.log("Start generate");
      // this.constructionArticle.basePath = this.generateFolder();

      // this.thread = await this.assistantService.createThread(); // Step 1: creer un thread unique pour tous les assistants.
      // this.constructionArticle.mainThreadId = this.thread.id

      // await this.thoughtTree(prompt);
      // await Utils.writeFileSyncJson(path.join(this.constructionArticle.basePath, "articleMetaDatas.json"), this.constructionArticle);

      // await this.WebSearchService.makeResearch(this.constructionArticle);
      // await Utils.writeFileSyncJson(path.join(this.constructionArticle.basePath, "articleMetaDatas.json"), this.constructionArticle);

      // await this.evaluateSiteRelevance();
      // Logger.info("====================================================================================================");
      // await Utils.writeFileSyncJson(path.join(this.constructionArticle.basePath, "articleMetaDatas.json"), this.constructionArticle);

      await this.scrapWebPageAndResume();
      await Utils.writeFileSyncJson(path.join(this.constructionArticle.basePath, "articleMetaDatas.json"), this.constructionArticle);
      return "Success";
    } catch (error) {
      Logger.error(error, "Error: startGenerate");
      throw new Error("Error: " + error);
    }
  }

  public async thoughtTree(prompt: string): Promise<void> {
    let lastMessage = await this.runAssistant(step1.runCreateParams, step1.prompt, this.thread, "user");
    Logger.info(`Message thoughtTree step 1 done`);

    lastMessage = await this.runAssistant(step2.runCreateParams, step2.prompt.replace("[PROMPT]", prompt), this.thread, "user");
    lastMessage = await this.getIdeasArticle(lastMessage as unknown as object);
    await Utils.writeFileSyncJson(path.join(this.constructionArticle.basePath, "step2.txt"), lastMessage);
    Logger.info(`Message thoughtTree step 2 done`);

    lastMessage = await this.runAssistant(step3.runCreateParams, step3.prompt, this.thread, "user");
    await Utils.writeFileSyncJson(path.join(this.constructionArticle.basePath, "step3.txt"), lastMessage);
    Logger.info(`Message thoughtTree step 3 done`);

    lastMessage = await this.runAssistant(step4.runCreateParams, step4.prompt, this.thread, "user");
    await Utils.writeFileSyncJson(path.join(this.constructionArticle.basePath, "step4.txt"), lastMessage);
    Logger.info(`Message thoughtTree step 4 done`);

    lastMessage = await this.runAssistant(step5.runCreateParams, step5.prompt, this.thread, "user");
    await Utils.writeFileSyncJson(path.join(this.constructionArticle.basePath, "step5.txt"), lastMessage);
    Logger.info(`Message thoughtTree step 5 done`);

    lastMessage = await this.runAssistant(step5.runCreateParams, step6.prompt, this.thread, "user");
    lastMessage = await this.getTrameArticle(lastMessage as unknown as object);
    Logger.info(`Message thoughtTree step 6 done`);
  }

  // public async evaluateSiteRelevance(): Promise<string> {  
  //   try {
  //     const openai = new OpenAI();

  //     const trame = this.constructionArticle.trame;
  //       for (let i = 0; i < trame.trame.sections.length; i++) {
  //         const section = trame.trame.sections[i];
  //         const searchKeywords = section.searchKeywords;
  //         const context = `Titre de la section de l'article : ${section.subTitle} \n\n Contenu de la section de l'article : ${section.content}`;
  //         const role = evaluateSearch.role.replace("[CONTEXTE_DE_L_ARTICLE]", context).replace("[EXPECTATION_GOOGLE]", searchKeywords.expected);
  //         for (let j = 0; j < searchKeywords.result.length; j++) {
  //           if (searchKeywords.result[j].title === "" || searchKeywords.result[j].link === "" || searchKeywords.result[j].description === "") {
  //             continue;
  //           }
  //           const prompt = evaluateSearch.prompt.replace("[TITRE_GOOGLE]", searchKeywords.result[j].title).replace("[DESCRIPTION_GOOGLE]", searchKeywords.result[j].description).replace("[EXPECTATION_GOOGLE]", searchKeywords.expected);
  //           const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
  //             { role: 'system', content: role },
  //             { role: 'user', content: prompt },
  //           ];
  //           const response = await openai.chat.completions.create({
  //             model: 'chatgpt-4o-latest',
  //             max_tokens: 250,
  //             messages
  //           });
  //           const resp = response.choices[0].message.content.trim();
  //           Logger.info(`Reponse de l'assistant: ${resp}`);
  //           trame.trame.sections[i].searchKeywords.result[j].relevance = resp.includes("OUI") ? true : false;
  //           trame.trame.sections[i].searchKeywords.result[j].revelanceJustification = resp;
  //           sleepFct(2000);
  //         }
  //       }
  //     return "Success";
  //   } catch (error) {
  //     Logger.error(error, "Error: evaluateSiteRelevance");
  //     throw new Error("Error evaluateSiteRelevance: " + error);
  //   }
  // }

  public async evaluateSiteRelevance(): Promise<string> {
    try {
      const openai = new OpenAI();
      const MAX_CONCURRENT_JOBS = 20; // Limite des processus simultanés
      const activeJobs: Set<{ promise: Promise<void>; isCompleted: boolean }> = new Set(); // File d'attente avec métadonnées
      const trame = this.constructionArticle.trame;
  
      for (let i = 0; i < trame.trame.sections.length; i++) {
        const section = trame.trame.sections[i];
        const searchKeywords = section.searchKeywords;
        const context = `Titre de la section de l'article : ${section.subTitle} \n\n Contenu de la section de l'article : ${section.content}`;
        const role = evaluateSearch.role
          .replace("[CONTEXTE_DE_L_ARTICLE]", context)
          .replace("[EXPECTATION_GOOGLE]", searchKeywords.expected);
  
        for (let j = 0; j < searchKeywords.result.length; j++) {
          if (searchKeywords.result[j].title === "" || searchKeywords.result[j].link === "" || searchKeywords.result[j].description === "") {
            continue;
          }
  
          // Ajouter un job à la file d'attente avec un statut de suivi
          const job = {
            promise: (async () => {
              try {
                const prompt = evaluateSearch.prompt
                  .replace("[TITRE_GOOGLE]", searchKeywords.result[j].title)
                  .replace("[DESCRIPTION_GOOGLE]", searchKeywords.result[j].description)
                  .replace("[EXPECTATION_GOOGLE]", searchKeywords.expected);
  
                const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
                  { role: 'system', content: role },
                  { role: 'user', content: prompt },
                ];
  
                const response = await openai.chat.completions.create({
                  model: 'chatgpt-4o-latest',
                  max_tokens: 250,
                  messages,
                });
  
                const resp = response.choices[0].message.content.trim();
                Logger.info(`Reponse de l'assistant: ${resp}`);
                trame.trame.sections[i].searchKeywords.result[j].relevance = resp.includes("OUI");
                trame.trame.sections[i].searchKeywords.result[j].revelanceJustification = resp;
              } catch (error) {
                Logger.error(`Erreur lors de l'évaluation du résultat "${searchKeywords.result[j].title}": ${error.message}`);
              }
            })(),
            isCompleted: false,
          };
  
          activeJobs.add(job);
  
          // Limiter à MAX_CONCURRENT_JOBS en attendant qu'un job se termine
          if (activeJobs.size >= MAX_CONCURRENT_JOBS) {
            await Promise.race([...activeJobs].map((j) => j.promise)); // Attend qu'au moins une Promise se termine
            [...activeJobs].forEach((job) => {
              job.promise.finally(() => {
                job.isCompleted = true; // Met à jour le statut une fois terminé
                activeJobs.delete(job); // Supprime le job terminé
              });
            });
          }
        }
      }
  
      // Attendre que toutes les Promises restantes soient terminées
      await Promise.all([...activeJobs].map((job) => job.promise));
      return "Success";
    } catch (error) {
      Logger.error(error, "Error: evaluateSiteRelevance");
      throw new Error("Error evaluateSiteRelevance: " + error);
    }
  }

  public async getIdeasArticle(response: any): Promise<string> {
    try {
      const ideas = JSON.parse(this.extractJsonContent(response));
      await Utils.writeFileSyncJson(path.join(this.constructionArticle.basePath, "ideas.json"), ideas);
      return ideas;
    } catch (error) {
      Logger.error(error, "Error: getIdeasArticle");
      throw new Error("Error getIdeasArticle: " + error);
    }
  }

  public async getTrameArticle(response: any): Promise<string> {
    try {
      const trame = JSON.parse(this.extractJsonContent(response));
      this.constructionArticle.title = trame.trame.title;
      Logger.info(`Title: ${trame.trame.title}`);
      Logger.info(`Introduction: ${trame.introduction}`);
  
      if (trame.trame.sections.length === 0) {
        Logger.error("sections vide");
        throw new Error("sections vide" + JSON.stringify(trame));
      }

      if (!trame.trame.sections[0].subTitle || !trame.trame.sections[0].content) {
        Logger.error("subTitle vide | content vide");
        throw new Error("subTitle vide" + JSON.stringify(trame));
      }

      this.constructionArticle.trame = trame;
      this.constructionArticle.nbSections = trame.trame.sections.length;

      await Utils.writeFileSyncJson(path.join(this.constructionArticle.basePath, "trame.json"), trame);
      return trame;
    } catch (error) {
      Logger.error(error, "Error: getTrameArticle");
      throw new Error("Error getTrameArticle: " + error);
    }
  }

  public async scrapWebPageAndResume(): Promise<void> {
    const openai = new OpenAI();
    const sections = this.constructionArticle.trame.trame.sections;
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      for (let j = 0; j < section.searchKeywords.result.length; j++) {
        const searchResult = section.searchKeywords.result[j];
        if (searchResult.relevance === true) {
          const content = await this.WebSearchService.scrapWebSite(searchResult.link, searchResult.title, this.constructionArticle.basePath);
          section.content = content;


          const context = `Titre de la section de l'article : ${section.subTitle} \n\n Contenu de la section de l'article : ${section.content}`;
          const role = resumeWebSite.role
            .replace("[CONTEXTE_DE_L_ARTICLE]", context)
            .replace("[EXPECTATION_GOOGLE]", section.searchKeywords.expected);
            const prompt = resumeWebSite.prompt
            .replace("[CONTENT]", content)
            .replace("[EXPECTATION_GOOGLE]", section.searchKeywords.expected);
         
          const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
            { role: 'system', content: role },
            { role: 'user', content: prompt },
          ];

          const response = await openai.chat.completions.create({
            model: 'chatgpt-4o-latest',
            max_tokens: 15000,
            messages,
          });

          const resp = response.choices[0].message.content.trim();
          Logger.info(`Reponse de l'assistant: ${resp}`);
          return;
        }
      }
    }
  }

  public async runAssistant(params: RunCreateParams, prompt: string | null, thread?: OpenAI.Beta.Threads.Thread, role?: ("user" | "assistant"), attachments?: OpenAI.Beta.Threads.Messages.MessageCreateParams.Attachment[] | null): Promise<string> {
    await super.runAssistant(params, prompt, thread, role, attachments);
    await sleepFct(1000);
    return await this.assistantService.getlastMessage(thread.id);
  }

  public async postProcess(article: string): Promise<string> {
    let newArticle = "";
    let nbFautes = 0;
    let totalLetters = 0;
    let detectDot = false;
    let totalVirgule = 0;
    const graineLow = randomInt(0, 5);
    const articleTmp = article.replace(/\s*\[.*?\]\s*/g, " ");
    let balise = false;
    if (articleTmp.length > 10) {
      article = articleTmp;
    }

    for (let i = 0; i < article.length; i++) {
        const letterUpperCaseRegex = /[A-Z]/;

        if (article[i] === "," && randomChance(randomInt(3, 5 + graineLow))) {
            newArticle += ` ${article[i]} `;
            nbFautes++;
            totalVirgule++;
        } else if (article[i] === "<") {
          balise = true;
          newArticle += article[i];
          detectDot = false;
        } else if (article[i] === ">") {
          balise = false;
          newArticle += article[i];
          detectDot = false;
        } else if (balise === false && letterUpperCaseRegex.test(article[i]) && randomChance(randomInt(1, 3 + graineLow))) {
            newArticle += article[i].toLowerCase();
            nbFautes++;
        } 
        else if (article[i] === ".") {
          detectDot = true;
          newArticle += article[i];
        } else if (detectDot === true && randomChance(randomInt(0, 5 + graineLow)) === true) {
          newArticle += article[i].toLowerCase();
          detectDot = false;
          nbFautes++;
        } else {
          newArticle += article[i];
          detectDot = false;
        }
        totalLetters++;
    }
    Logger.info("Nombre de fautes: " + nbFautes);
    Logger.info("Nombre de lettres: " + totalLetters);
    Logger.info("Nombre de virgules: " + totalVirgule);
    Logger.info("Pourcentage de fautes: " + (nbFautes / totalLetters) * 100);
    Logger.info("Graine low: " + graineLow);
    return newArticle;
  }

  public generateFolder(): string {
    const baseDir = basePath;
    const folders = fs.readdirSync(baseDir).filter((file) => {
        return fs.statSync(path.join(baseDir, file)).isDirectory();
    });
    const folderCount = folders.length;
    let newFolderName = String(folderCount + 1).padStart(2, '0');
   
    if (fs.existsSync(path.join(baseDir, newFolderName))) {
      newFolderName = newFolderName + "_" + new Date().getTime();
    }

    const newFolderPath = path.join(baseDir, newFolderName);
    fs.mkdirSync(newFolderPath);
    Logger.info(`Dossier créé : ${newFolderPath}`);
    return newFolderPath;
  }

  public extractJsonContent(input: string): string {
    const regex = /```json([\s\S]*?)```/g;
    const match = regex.exec(input);

    if (match && match[1]) {
        return match[1].trim();
    }
    
    return input.trim();
  }
}