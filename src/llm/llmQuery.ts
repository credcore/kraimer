import { debugPrint } from "../logger/log.js";
import { extractJson } from "./extractJson.js";
import { llmFactory } from "./llmFactory.js";
import { LLMCompletionResponse } from "./types.js";
import { cacheResponse } from "./cacheResponse.js";

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
  llmName: string,
  model: string,
  query: string,
  images: string[],
  useCache: boolean,
  maxCostPerSession: number,
  responseType: string = "json",
  responseJsonSchema: string
): Promise<{ response: LLMCompletionResponse; json?: any; text?: string }> => {
  // Check if the total session tokens exceed the maximum allowed
  if (images && !Array.isArray(images)) {
    throw new TypeError("images must be a list or null");
  }

  debugPrint(query, "Input to LLM");

  if (images) {
    debugPrint(`Number of images: ${images.length}`);
  }

  const messages = constructMessage(query, images);

  const llm = llmFactory(llmName);

  const currentCost = 0;
  if (currentCost > maxCostPerSession) {
    throw new Error("Maximum session cost exceeded.");
  }

  const llmResponse = await llm.invokeCompletion(model, messages, useCache);

  // Increase the total session tokens by the tokens used in this completion
  const totalSessionCost = currentCost + llmResponse.cost;

  debugPrint(`${llmName} response_cost=${llmResponse.cost}`);
  debugPrint(`${llmName} session_cost=${totalSessionCost}`);

  const responseValue =
    responseType === "json"
      ? extractJson(llmResponse.response)
      : llmResponse.response;

  // Cache the response in the database
  await cacheResponse(llmResponse);

  return {
    response: llmResponse,
    ...(responseType === "json"
      ? { json: responseValue }
      : { text: responseValue }),
  };
};
