import crypto from "crypto";
import * as os from "os";
import axios from "axios";
import { AxiosRetry, exponentialDelay } from "axios-retry";
import { countTokens } from "./countTokens";
import { debugPrint } from "../logger/debugPrint";
import { globalSettings } from "../settings";
import { SettingsError } from "../strategy/SettingsError";
import { cacheResponse } from "./cacheResponse";
import { getCachedResponse } from "./getCachedResponse";
import { LLMCompletionResponse, LLMError } from "./llmTypes";

// Define an app-wide constant for total session tokens
let totalSessionCost = 0.0;

type RetryCallback = () => void;

const createLLMRetry = (
  callback?: RetryCallback,
  options?: any
): AxiosRetry => {
  const retryCondition = (error: any) => {
    if (callback) callback();
    debugPrint(`Retry triggered due to: ${error}`);
    return true;
  };

  return new AxiosRetry({
    retries: globalSettings.rpc_retries,
    retryDelay: exponentialDelay,
    retryCondition,
    ...options,
  });
};

const getMaxCostPerSession = (): number => {
  return globalSettings.max_cost_per_session;
};

export const invokeCompletion = async (
  messages: { role: string; content: any }[],
  model: string
): Promise<LLMCompletionResponse> => {
  totalSessionCost; // Access the app-wide totalSessionCost

  // Calculate a hash of the prompt for caching
  const promptHash = crypto
    .createHash("sha256")
    .update(JSON.stringify(messages))
    .digest("hex");

  // First, try to get the response from the cache
  if (globalSettings.search_llm_cache) {
    const llm = "azure_openai"; // Hardcoding the LLM value as it's always "azure_openai"
    const cachedResponse = await getCachedResponse(promptHash, model, llm);
    if (
      cachedResponse &&
      !globalSettings.ignore_llm_cache_entry.includes(cachedResponse.responseId)
    ) {
      debugPrint("Response loaded from cache.");
      debugPrint(cachedResponse.response);
      return cachedResponse;
    }
  }

  if (globalSettings.disable_rpc) {
    throw new SettingsError(
      "RPC is disabled via the --disable_rpc flag. Refusing to call APIs."
    );
  }

  debugPrint(
    `model=${model} prompt_length_chars=${JSON.stringify(messages).length}`
  );

  // Read AZURE_OPENAI_API_KEY from the environment
  const apiKey = os.env.AZURE_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("AZURE_OPENAI_API_KEY environment variable is not set");
  }

  const modelEndpoints: { [key: string]: string | undefined } = {
    "gpt-3.5-turbo": os.env.AZURE_OPENAI_GPT_35_TURBO_CHAT_COMPLETIONS_ENDPOINT,
    "gpt-4o": os.env.AZURE_OPENAI_GPT_4O_CHAT_COMPLETIONS_ENDPOINT,
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
  const retries = createLLMRetry(() => debugPrint("Timed out. Retrying."));

  try {
    const response = await axios.post(completionsEndpoint, payload, {
      headers,
      timeout: globalSettings.rpc_timeout,
      retry: retries,
    });
    debugPrint(response.data);

    // Parse the response JSON
    const responseJson = response.data;

    // Create and return an instance of the LLMCompletionResponse type
    const result: LLMCompletionResponse = {
      llm: "azure_openai",
      model,
      promptHash,
      prompt: JSON.stringify(messages),
      responseId: responseJson.id,
      response: responseJson.choices[0].message.content,
      finishReason: responseJson.choices[0].finish_reason,
      promptTokens: responseJson.usage.prompt_tokens,
      completionTokens: responseJson.usage.completion_tokens,
      totalTokens: responseJson.usage.total_tokens,
      error: undefined,
    };

    if (globalSettings.update_llm_cache) {
      cacheResponse(result);
    }

    debugPrint(
      `OPENAI chat completion:prompt_tokens=${result.promptTokens}, completion_tokens=${result.completionTokens}, total_tokens=${result.totalTokens}`
    );

    // Increase the total session tokens by the tokens used in this completion
    totalSessionCost += calculateCost(
      result.promptTokens,
      result.completionTokens,
      result.totalTokens
    );

    debugPrint(`OPENAI session_cost=${totalSessionCost}`);

    // Check if the total session tokens exceed the maximum allowed
    const maxCostPerSession = getMaxCostPerSession();
    if (totalSessionCost > maxCostPerSession) {
      throw new LLMError("Maximum session cost exceeded.");
    }

    return result;
  } catch (error) {
    if (axios.isAxiosError(error) && error.code === "ECONNABORTED") {
      throw new LLMError(
        `Request timed out after ${globalSettings.rpc_timeout} seconds.`
      );
    }
    throw new LLMError(`Request failed: ${error.message}`);
  }
};

const calculateCost = (
  promptTokens: number,
  completionTokens: number,
  totalTokens: number,
  images: { [key: string]: number | string }[] = [],
  model: string = globalSettings.model
): number => {
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
  const imageCost = images.length * 0.0035;

  // Calculate the total cost by adding token cost and image cost
  const totalCost = totalTokenCost + imageCost;

  return totalCost;
};
