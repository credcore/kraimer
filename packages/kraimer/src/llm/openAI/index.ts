import OpenAI from "openai";
import { debugPrint } from "../../logger/log.js";
import { LLMResponse, Message } from "../types.js";

// Define an app-wide constant for total session tokens
let totalSessionCost = 0.0;

export type CompletionOptions = {
  maxCostPerSession: number;
  currentCost: number;
};

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error("OPENAI_API_KEY environment variable is not set");
}

const openai = new OpenAI({
  apiKey,
});

export const invokeCompletion = async (
  model: string,
  messages: Message[]
): Promise<Omit<LLMResponse, "extractionId" | "promptHash">> => {
  totalSessionCost; // Access the app-wide totalSessionCost

  debugPrint(
    `model=${model} prompt_length_chars=${JSON.stringify(messages).length}`
  );

  try {
    const chatCompletion = await openai.chat.completions.create({
      model,
      messages,
      temperature: 0,
    });

    debugPrint(chatCompletion);

    if (!chatCompletion.usage) {
      throw new Error(`Unable to fetch usage stats. Stopping.`);
    }

    // Create and return an instance of the LLMCompletionResponse type
    const llmResponse: Omit<LLMResponse, "extractionId" | "promptHash"> = {
      llm: "openai",
      model,
      prompt: JSON.stringify(messages),
      responseId: chatCompletion.id,
      response: chatCompletion.choices[0].message.content ?? "",
      finishReason: chatCompletion.choices[0].finish_reason,
      promptTokens: chatCompletion.usage.prompt_tokens,
      completionTokens: chatCompletion.usage.completion_tokens,
      totalTokens: chatCompletion.usage.total_tokens,
      cost: calculateCost(
        model,
        chatCompletion.usage.prompt_tokens,
        chatCompletion.usage.completion_tokens,
        chatCompletion.usage.total_tokens,
        messages
      ),
      error: undefined,
    };

    debugPrint(
      `OPENAI chat completion:prompt_tokens=${llmResponse.promptTokens}, completion_tokens=${llmResponse.completionTokens}, total_tokens=${llmResponse.totalTokens}`
    );

    return llmResponse;
  } catch (error: any) {
    throw new Error(`Request failed: ${error.message}`);
  }
};

export function calculateCost(
  model: string,
  promptTokens: number,
  completionTokens: number,
  totalTokens: number,
  messages: Message[]
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

  // Calculate the cost for images (if applicable)
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
