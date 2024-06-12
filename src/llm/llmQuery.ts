import { debugPrint } from "../logger/log.js";
import { extractJson } from "./extractJson.js";
import { llmFactory } from "./llmFactory.js";
import { LLMResponse } from "./types.js";
import { saveResponse } from "./saveResponse.js";
import { getExtractionCost } from "./getExtractionCost.js";
import crypto from "crypto";
import { getCachedResponse } from "./getCachedResponse.js";

export const constructMessage = (
  prompt: string,
  images?: string[]
): { role: string; content: any }[] => {
  const messageContent: {
    type: string;
    text?: string;
    image_url?: { url: string };
  }[] = [{ type: "text", text: prompt }];
  if (images) {
    for (const image of images) {
      messageContent.push({ type: "image_url", image_url: { url: image } });
    }
  }
  return [{ role: "user", content: messageContent }];
};

export const llmQuery = async (
  extractionId: number,
  llmName: string,
  model: string,
  query: string,
  images: string[],
  useCache: boolean,
  maxCostPerSession: number,
  responseType: string = "json"
): Promise<{ response: LLMResponse; json?: any; text?: string }> => {
  // Check if the total session tokens exceed the maximum allowed
  if (images && !Array.isArray(images)) {
    throw new TypeError("images must be a list or null");
  }

  debugPrint(query, "Input to LLM");

  if (images) {
    debugPrint(`Number of images: ${images.length}`);
  }

  const messages = constructMessage(query, images);

  // Calculate a hash of the prompt for caching
  const promptHash = crypto
    .createHash("sha256")
    .update(JSON.stringify(messages))
    .digest("hex");

  const currentCost = await getExtractionCost(extractionId);

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

          const responseFromLLM = await llm.invokeCompletion(
            model,
            messages,
            useCache
          );

          const fullResponse = { ...responseFromLLM, promptHash };
          await saveResponse(fullResponse);
          return fullResponse;
        })();

  // Increase the total session tokens by the tokens used in this completion
  const totalSessionCost = currentCost + llmResponse.cost;

  debugPrint(`${llmName} response_cost=${llmResponse.cost}`);
  debugPrint(`${llmName} session_cost=${totalSessionCost}`);

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
};
