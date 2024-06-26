import { debugPrint } from "../logger/log.js";
import { extractJson } from "./extractJson.js";
import { llmFactory } from "./llmFactory.js";
import { LLMResponse, Message } from "./types.js";
import { saveResponse } from "./saveResponse.js";
import { getExtractionCost } from "../domain/getExtractionCost.js";
import crypto from "crypto";
import { getCachedResponse } from "./getCachedResponse.js";
import { toPrettyPrintableMessages } from "./toPrettyPrintableMessages.js";

export async function llmQuery(
  extractionId: number,
  model: string,
  messages: Message[],
  useCache: boolean,
  maybeMaxCostPerSession?: number,
  maybeLlmName?: string,
  responseType: string = "json"
): Promise<{ response: LLMResponse; json?: any; text?: string }> {
  const maxCostPerSession =
    maybeMaxCostPerSession ?? process.env.KRAIMER_LLM_MAX_COST_PER_SESSION
      ? Number(process.env.KRAIMER_LLM_MAX_COST_PER_SESSION)
      : 50;

  const llmName = maybeLlmName ?? process.env.KRAIMER_LLM;

  if (!llmName) {
    throw new Error(`Specify an llm name or set the KRAIMER_LLM env variable.`);
  }

  // Calculate a hash of the prompt for caching
  const promptHash = crypto
    .createHash("sha256")
    .update(JSON.stringify(messages))
    .digest("hex");

  const currentCost = (await getExtractionCost(extractionId)) ?? 0;

  // First, try to get the response from the cache
  const cachedResponse = await getCachedResponse(promptHash, model, llmName);

  const llmResponse =
    cachedResponse && useCache
      ? await (async () => {
          debugPrint("Response loaded from cache.");
          debugPrint(cachedResponse.response);
          return cachedResponse;
        })()
      : await (async () => {
          const llm = llmFactory(llmName);

          if (currentCost > maxCostPerSession) {
            throw new Error("Maximum session cost exceeded.");
          }

          debugPrint(toPrettyPrintableMessages(messages));

          const responseFromLLM = await llm.invokeCompletion(model, messages);

          const fullResponse = { ...responseFromLLM, extractionId, promptHash };
          await saveResponse(fullResponse);
          return fullResponse;
        })();

  // Increase the total session tokens by the tokens used in this completion
  const totalSessionCost = currentCost + llmResponse.cost;

  debugPrint(`${llmName} response_cost=${llmResponse.cost}`);
  debugPrint(`${llmName} extraction_cost=${totalSessionCost}`);

  const responseValue =
    responseType === "json"
      ? extractJson(llmResponse.response)
      : llmResponse.response;

  return {
    response: llmResponse,
    ...(responseType === "json"
      ? { json: responseValue }
      : { text: responseValue }),
  };
}
