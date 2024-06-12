import { debugPrint } from "../../logger/log.js";
import { LLMResponse } from "../types.js";

// Define an app-wide constant for total session tokens
let totalSessionCost = 0.0;

export type CompletionOptions = {
  maxCostPerSession: number;
  currentCost: number;
};

export const invokeCompletion = async (
  model: string,
  messages: { role: string; content: any }[]
): Promise<Omit<LLMResponse, "extractionId" | "promptHash">> => {
  totalSessionCost; // Access the app-wide totalSessionCost

  debugPrint(
    `model=${model} prompt_length_chars=${JSON.stringify(messages).length}`
  );

  // Read AZURE_OPENAI_API_KEY from the environment
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("AZURE_OPENAI_API_KEY environment variable is not set");
  }

  const modelEndpoints: { [key: string]: string | undefined } = {
    "gpt-3.5-turbo":
      process.env.AZURE_OPENAI_GPT_35_TURBO_CHAT_COMPLETIONS_ENDPOINT,
    "gpt-4o": process.env.AZURE_OPENAI_GPT_4O_CHAT_COMPLETIONS_ENDPOINT,
  };

  const completionsEndpoint = modelEndpoints[model];

  if (!completionsEndpoint) {
    throw new Error(`No endpoint found for model: ${model}`);
  }

  debugPrint(`OPENAI endpoint=${completionsEndpoint}`);

  // Prepare the request payload
  const payload = {
    model,
    messages,
    temperature: 0,
  };

  const headers = { "Content-Type": "application/json", "api-key": apiKey };

  // Configure retry strategy
  const retryFetch = async (
    url: string,
    options: RequestInit,
    retries: number = 3,
    delay: number = 1000
  ): Promise<Response> => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, options);
        if (response.ok) {
          return response;
        }
        if (i < retries - 1) {
          debugPrint(`Retrying... (${i + 1}/${retries})`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      } catch (error) {
        if (i === retries - 1) {
          throw error;
        }
        debugPrint(`Retrying... (${i + 1}/${retries})`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    throw new Error("Failed to fetch after multiple retries");
  };

  try {
    const response = await retryFetch(completionsEndpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const responseJson: any = await response.json();
    debugPrint(responseJson);

    // Create and return an instance of the LLMCompletionResponse type
    const llmResponse: Omit<LLMResponse, "extractionId" | "promptHash"> = {
      llm: "azure_openai",
      model,
      prompt: JSON.stringify(messages),
      responseId: responseJson.id,
      response: responseJson.choices[0].message.content,
      finishReason: responseJson.choices[0].finish_reason,
      promptTokens: responseJson.usage.prompt_tokens,
      completionTokens: responseJson.usage.completion_tokens,
      totalTokens: responseJson.usage.total_tokens,
      cost: calculateCost(
        model,
        responseJson.usage.prompt_tokens,
        responseJson.usage.completion_tokens,
        responseJson.usage.total_tokens,
        messages
      ),
      error: undefined,
    };

    debugPrint(
      `OPENAI chat completion:prompt_tokens=${llmResponse.promptTokens}, completion_tokens=${llmResponse.completionTokens}, total_tokens=${llmResponse.totalTokens}`
    );

    return llmResponse;
  } catch (error: any) {
    throw new Error(`Request failed: ${error}`);
  }
};

// In src/llm/azureOpenAI/index.ts

export function calculateCost(
  model: string,
  promptTokens: number,
  completionTokens: number,
  totalTokens: number,
  messages: { role: string; content: any }[]
): number {
  // Define the cost per 1000 tokens for each model
  const costPerMillionTokens: {
    [key: string]: { input: number; output: number };
  } = {
    "gpt-4o": { input: 5.0, output: 15.0 },
    "gpt-3.5-turbo": { input: 0.5, output: 1.5 },
  };

  // Get the cost per 1000 tokens for the current model
  const tokenCost = costPerMillionTokens[model];

  if (!tokenCost) {
    throw new Error(`Unknown model: ${model}`);
  }

  // Calculate the total cost based on the number of tokens
  const totalTokenCost =
    (promptTokens / 1000000) * tokenCost.input +
    (completionTokens / 1000000) * tokenCost.output;

  // Calculate the cost for images
  const imageCount = messages.reduce((count, message) => {
    if (message.content && Array.isArray(message.content)) {
      count += message.content.filter(
        (item) => item.type === "image_url"
      ).length;
    }
    return count;
  }, 0);
  const imageCost = imageCount * 0.0035;

  // Calculate the total cost by adding token cost and image cost
  const totalCost = totalTokenCost + imageCost;

  return totalCost;
}
