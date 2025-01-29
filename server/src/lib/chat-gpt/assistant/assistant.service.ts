// chatGptService/libs/chatgpt-api/src/lib/generate-article/generate-article.service.ts

import OpenAI from "openai";
import * as dotenv from 'dotenv';
import { Assistant } from "openai/resources/beta/assistants";
import { RunSubmitToolOutputsParams } from "openai/resources/beta/threads/runs/runs";
import * as fs from "fs";
import { FilePurpose } from "openai/resources";
import { getbasePath, Logger, sleepFct } from "./../../utils";


dotenv.config({path: getbasePath('.env')});  

const openai = new OpenAI();

export class AssistantService {
  public indexFile = 0;
  public totalTokens = 0;
  public basePath = getbasePath('shared/embed-html');

  async getAssistanceList(): Promise<Assistant[]> {
    const myAssistants = await openai.beta.assistants.list({
      order: "desc",
      limit: 20,
    });
  
    return myAssistants.data
  }

  async getAssistantById(assistantId: string): Promise<Assistant> {
    const assistant = await openai.beta.assistants.retrieve(assistantId);
    return assistant;
  }

  async setAssistantById(assistantId: string, assistant: Assistant): Promise<Assistant> {
    const keyObjectAllowed = ['model', 'name', 'description', 'instructions', 'tools', 'tool_resources', 'metadata', 'temperature', 'top_p', 'response_format'];
    Object.keys(assistant).forEach(key => {
      if (!keyObjectAllowed.includes(key)) {
        delete assistant[key];
      }
      // check null
      if (assistant[key] === null) {
        delete assistant[key];
      }
    });
    const updatedAssistant = await openai.beta.assistants.update(assistantId, assistant);
    return updatedAssistant;
  }

  async deleteAssistantById(assistantId: string): Promise<void> {
    await openai.beta.assistants.del(assistantId);
  }

  async createThread(paramThread?: OpenAI.Beta.Threads.ThreadCreateParams): Promise<OpenAI.Beta.Threads.Thread> {
    if (paramThread) {
      return await openai.beta.threads.create(paramThread);
    } else {
      return await openai.beta.threads.create();
    }
  }

  async retrieveThread(threadId: string): Promise<OpenAI.Beta.Threads.Thread> {
    return await openai.beta.threads.retrieve(threadId);
  }

  async createMessage(threadId: string, message: OpenAI.Beta.Threads.Messages.MessageCreateParams): Promise<OpenAI.Beta.Threads.Message> {
    return await openai.beta.threads.messages.create(threadId, message);
  }

  async listMessages(threadId: string, sort = "desc" as "desc" | "asc"): Promise<any> {
    return await openai.beta.threads.messages.list(threadId, { order: sort });
  }

  async createRun(threadId: string, run: OpenAI.Beta.Threads.Runs.RunCreateParams): Promise<OpenAI.Beta.Threads.Runs.Run> {
    return await openai.beta.threads.runs.create(threadId, run) as OpenAI.Beta.Threads.Runs.Run;
  }

  async getRun(threadId: string, runId: string): Promise<any> {
    return await openai.beta.threads.runs.retrieve(threadId, runId);
  }

  async submitToolOutputsAndPoll(threadId: string, runId: string, toolOutputs: Array<RunSubmitToolOutputsParams.ToolOutput>): Promise<any> {
    return await openai.beta.threads.runs.submitToolOutputsAndPoll(threadId, runId, { tool_outputs: toolOutputs });
  }

  async getlastMessage(threadId: string): Promise<string> {
    const messages = await this.listMessages(threadId);
    if (messages.data && messages.data.length > 0 && messages.data[0].content && messages.data[0].content.length > 0) {
      return messages.data[0].content[0].text.value;
    } else {
      return "";
    }
  }

  async updateRoleLastMessage(threadId: string, role: "user" | "assistant"): Promise<void> {
    const lastMessage = await this.listMessages(threadId);
    const lastMessageId = lastMessage.data[0].id;
    // Delete last message
    await openai.beta.threads.messages.del(threadId, lastMessageId);
    // Create new message
    await this.createMessage(threadId, {
      role: role,
      content: lastMessage.data[0].content[0].text.value
    });
  }

  async uploadFile(filePath: string, purpose: FilePurpose = "assistants"): Promise<OpenAI.Files.FileObject | boolean> {
    try {
      const file = await openai.files.create({
        file: fs.createReadStream(filePath),
        purpose: purpose,
      });
      if (file && file.id) {
        Logger.info("File uploaded successfully " + file.id );
        return file;
      }
    } catch (error) {
      Logger.error(error, "Error: uploadFile");
    }
    Logger.error(`Error: uploadFile - ${filePath}`);
    return false;
  }

  async getFileList(): Promise<OpenAI.Files.FileObject[]> {
    const list = await openai.files.list();
    return list.data;
  }

  async uploadVectorFile(vectorStoresId: string, fileId: string): Promise<OpenAI.Beta.VectorStores.Files.VectorStoreFile> {
    const myVectorStoreFile = await openai.beta.vectorStores.files.create(
      vectorStoresId,
      {
        file_id: fileId
      }
    );
    return myVectorStoreFile;
  }

  async findFileByName(fileName: string): Promise<OpenAI.Files.FileObject> {
    const list = await this.getFileList();
    return list.find(file => file.filename === fileName);
  }

  async deleteFile(fileId: string): Promise<boolean> {
    try {
      await openai.files.del(fileId);
      return true;
    } catch (error) {
      Logger.error(error, "Error: deleteFile");
      return false;
    }
  }

  async deleteFileByName(fileName: string): Promise<boolean> {
    const file = await this.findFileByName(fileName);
    if (file) {
      await this.deleteFile(file.id);
      return true;
    }
    return false;
  }

  async overideFileAssistant(assistantId: string, filesName: string[]): Promise<boolean> {
    try {
      const assistant = await this.getAssistantById(assistantId);
      const fileIds = [];
      for (const name of filesName) {
        const file = await this.findFileByName(name);
        await sleepFct(2000);
        fileIds.push(file.id);
      }
      assistant.tool_resources = { code_interpreter: {file_ids: fileIds} };
      await this.setAssistantById(assistantId, assistant);
      return true;
    } catch (error) {
      Logger.error(error, "Error: overideFileAssistant");
      return false;
    }
  }

  internetSearch = async (prompt: string): Promise<any> => {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]  = [
      {
          role: "system",
          content: `
            tu es un expert en recherche de lien sur internet.
            tu vas devoir trouver des liens internet qui correspondent à la demande de l'utilisateur.
            Ta mission renvoyer l'url complete lien qui correspond à la demande de l'utilisateur.
            Ne renvoie rien d'autre que les url.
      [Lien 1: ]
      [Lien 2: ]
      [Lien 3: ]
        ect...
      
          `
      },
      {
          role: "user",
          content: (
              `Trouve moi 10 liens internet (URL complete) qui parle d'itineraire pour une lune de miel en italie de 7 en partant de naples.
              Soit precis. Je ne veux que des lien l'itineraire pour une lune de miel en italie de 7 en partant de naples.`
          ),
      },
  ];

    try {
      const clientPerp = new OpenAI({apiKey: "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", baseURL: "https://api.perplexity.ai"})
      const response = clientPerp.chat.completions.create({
        model: "llama-3.1-sonar-small-128k-online",
        messages,
      })
      console.log(response)
      return response
    } catch (error) {
      console.error(error);
    }
  };

  async messageCompletion(model:string, messages:OpenAI.Chat.Completions.ChatCompletionMessageParam[]): Promise<any> {
    return openai.chat.completions.create({
      model,
      messages
    });
  }

}
