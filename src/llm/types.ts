export type LLMCompletionResponse = {
  llm: string;
  model: string;
  promptHash: string;
  prompt: string;
  responseId: string;
  response: string;
  finishReason: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost: number;
  error?: string;
};

export type LLMError = Error & {
  name: string;
  message: string;
};

export type LLM = {
  invokeCompletion(
    model: string,
    messages: { role: string; content: any }[],
    useCache: boolean
  ): Promise<LLMCompletionResponse>;

  calculateCost(
    model: string,
    promptTokens: number,
    completionTokens: number,
    totalTokens: number,
    images?: { [key: string]: number | string }[]
  ): number;
};
