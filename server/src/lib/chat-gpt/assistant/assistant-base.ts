/**
 * Base class for an assistant.
 *
 * This abstract class provides generic functionalities for assistants.
 * Derived classes must implement the abstract method `getFunctionToCall` to
 * dynamically handle calling specific functions based on the function name.
 *
 * ---
 *
 * **How to Implement the AssistantBase Class**
 *
 * 1. **Extend AssistantBase**: Create a class that extends `AssistantBase`, specifying a `FunctionArgsMap` interface that maps function names to their argument types. If you have no functions to implement, you can omit `FunctionArgsMap`.
 *
 *    ```typescript
 *    // With functions
 *    interface FunctionArgsMap {
 *      myFunction: { arg1: string; arg2: number };
 *    }
 *
 *    class MyAssistant extends AssistantBase<FunctionArgsMap> {
 *      // Implementation
 *    }
 *
 *    // Without functions
 *    class SimpleAssistant extends AssistantBase {
 *      // Implementation
 *    }
 *    ```
 *
 * 2. **Implement `getFunctionToCall`**: Map function names to their implementations. If you have no functions, implement the method to return `undefined`.
 *
 *    ```typescript
 *    // With functions
 *    protected getFunctionToCall<K extends keyof FunctionArgsMap>(functionName: K): (args: FunctionArgsMap[K]) => Promise<string> {
 *      return {
 *        myFunction: this.myFunction.bind(this),
 *        // Add more mappings as needed
 *      }[functionName];
 *    }
 *
 *    // Without functions
 *    protected getFunctionToCall<K extends keyof {}>(functionName: K): undefined {
 *      return undefined;
 *    }
 *    ```
 *
 * 3. **Define Specific Functions**: Implement the functions with the specified arguments. If you have no functions, this step is not necessary.
 *
 *    ```typescript
 *    async myFunction(args: { arg1: string; arg2: number }): Promise<string> {
 *      // Implementation here
 *    }
 *    ```
 * 
 * **Note:**
 *
 * - **Without functions**: If your assistant does not need to handle dynamic functions, you can extend `AssistantBase` without specifying a `FunctionArgsMap` and implement `getFunctionToCall` accordingly.
 * - **Abstract Method**: Keeping `getFunctionToCall` as an abstract method ensures that derived classes are aware of its existence and implement it, even if it's to handle the case where there are no functions.
 */

import { AssistantService } from "./assistant.service";
import { appendFileSyncJson, getbasePath, Logger, sleepFct, writeFileSyncJson } from "./../../utils";
import { RunCreateParams, RunSubmitToolOutputsParams } from "openai/resources/beta/threads/runs/runs";
import { cleanMessage } from "./assistant.helper";
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import OpenAI from "openai";
import { Injectable } from "@nestjs/common";

@Injectable()
export abstract class AssistantBase<FunctionArgsMap> {
    public abstract assistantId: string;
    public indexFile = 0;
    public totalTokens = 0;
    public basePath = getbasePath('shared/itineraires');
    private stats = 0;
    

    constructor(protected assistantService: AssistantService) {}

    protected abstract getFunctionToCall<K extends keyof FunctionArgsMap>(
        functionName: K
    ): (args: FunctionArgsMap[K]) => Promise<string>;

    public abstract postProcess(args: any): Promise<string>;

    public async startGenerate(prompt: string): Promise<string> {
        const uniqueId = uuidv4();
        let threadId = null;
        let result = "";
        let triesFail = 2;
        let endOfConversation = false;
        let nextPrompt = "continue";
        let runConfig: RunCreateParams = {assistant_id: this.assistantId };

        while (endOfConversation === false && triesFail > 0) {
            try {
                if (threadId === null) {
                    threadId = await this.runAssistant(runConfig, prompt);
                } else {
                    const thread = await this.assistantService.retrieveThread(threadId);
                    threadId = await this.runAssistant(runConfig, nextPrompt, thread);
                }
                const nextStep = await this.nextStep(threadId);
                const { isFinished, lastMessage } = nextStep;
                nextPrompt = nextStep.nextPrompt;
                endOfConversation = isFinished;
                runConfig = nextStep.runConfig;
                result += this.cleanMessage(lastMessage);

                Logger.info("Message: " + lastMessage);
                Logger.info("Result: " + result);
                await appendFileSyncJson(path.join(this.basePath, `${uniqueId}_running.txt`), lastMessage);
                await sleepFct(1000);
            } catch (error) {
                Logger.error(error, "Error: startGenerate");
                triesFail--;
                if (triesFail === 0) {
                    throw new Error("Error: startGenerate " + error);
                }
            }
            await sleepFct(2000);
        }
        console.log("Result: " + result);
        result = await this.postProcess(result);
        console.log("Result: " + result);
        await writeFileSyncJson(path.join(this.basePath, `${uniqueId}_finished.txt`), result);
        Logger.info("Finished with Nb Token: " + this.stats);
        return result;
    }

    protected cleanMessage(message: string): string {
        return cleanMessage(message);
    }

    protected async nextStep(threadId: string): Promise<{
        isFinished: boolean;
        nextPrompt: string;
        lastMessage: string;
        runConfig: RunCreateParams;
    }> {
        const ret = {
            isFinished: false,
            nextPrompt: "",
            lastMessage: "",
            runConfig: {assistant_id: this.assistantId } as RunCreateParams,
        }
        const lastMessage = await this.assistantService.getlastMessage(threadId);
        ret.lastMessage = lastMessage;
        if (lastMessage.includes("[END]")) {
            ret.isFinished = true;
        } else {
            ret.nextPrompt = "continue";
        }
        return ret;
    }

    public async runAssistant(params: RunCreateParams, prompt: string | null, thread: OpenAI.Beta.Threads.Thread = null, role: ("user" | "assistant") = "user", attachments:OpenAI.Beta.Threads.Messages.MessageCreateParams.Attachment[] | null = null): Promise<any> {
        const continueRun = true;
        try {
            
            if (thread === null) {
                Logger.info("Creating new thread...");
                Logger.info(this.assistantService);
                thread = await this.assistantService.createThread();
            }
            const lastMessage = await this.assistantService.getlastMessage(thread.id);
            console.log(lastMessage);
            if (prompt !== null) {
                const messageParam: OpenAI.Beta.Threads.Messages.MessageCreateParams = {
                    role,
                    content: prompt
                }
                if (attachments !== null) {
                    messageParam.attachments = attachments;
                }
                await this.assistantService.createMessage(thread.id, messageParam);
            }

            const run = await this.createNewRun(thread.id, params);

            while (continueRun === true) {
                const running = await this.assistantService.getRun(thread.id, run.id);
                if (prompt !== null){
                    Logger.info(running.status + "..." +  prompt.slice(0, 50));
                } else {
                    Logger.info(running.status + "... No prompt");
                }
                if (running.status == "completed") {
                    break;
                } else if (running.status == "requires_action") {
                    const toolOutputs = await this.loopTools(running);
                    if (toolOutputs.length > 0) {
                        await this.assistantService.submitToolOutputsAndPoll(thread.id, run.id, toolOutputs);
                        Logger.info("Tool outputs submitted.");
                    }
                } else if (running.status == "incomplete") {
                    console.log("Incomplete");
                    console.log(running.incomplete_details);
                    await this.runAssistant(params, "continue", thread, role, attachments);
                } 
                else {
                    if (running.status !== "in_progress" && running.status !== "queued") {
                        Logger.error("Error: runAssistant Running" + JSON.stringify(running));
                        Logger.error("Error: runAssistant Running =======================" + running.status);
                        throw new Error(JSON.stringify(running));
                    }
                    await sleepFct(2000);
                }
            }
            const runStats = await this.assistantService.getRun(thread.id, run.id);
            this.indexFile++;
            this.totalTokens += runStats.usage.total_tokens;
            this.stats += runStats.usage.total_tokens;
            Logger.info("Run completed: " + run.id);
            Logger.info("Total tokens used: " + this.totalTokens);
            return thread.id;
        } catch (error) {
            Logger.error(error, "Error: runAssistant Stop prcess");
            throw new Error("Error: runAssistant " + error);
        }
    }

    public async createNewRun(threadId: string, params: RunCreateParams): Promise<OpenAI.Beta.Threads.Runs.Run> {
        return await this.assistantService.createRun(threadId, params);
    }

    async loopTools(run): Promise<RunSubmitToolOutputsParams.ToolOutput[]> {
        const outputs = [];
        try {
            for (const tool of run.required_action.submit_tool_outputs.tool_calls) {
                const functionName = tool.function.name as keyof FunctionArgsMap;
                const functionToCall = this.getFunctionToCall(functionName);

                if (functionToCall) {
                    const args = JSON.parse(tool.function.arguments) as FunctionArgsMap[typeof functionName];
                    const resp = await functionToCall(args);
                    outputs.push({
                        tool_call_id: tool.id,
                        output: resp,
                    });
                } else {
                    Logger.error(`Function ${tool.function.name} not found.`);
                }
                await sleepFct(2000);
            }
        } catch (error) {
            Logger.error(error, "Error: loopTools");
            throw new Error("Error: " + error);
        }
        return outputs;
    }
}