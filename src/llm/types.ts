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
  error?: string;
};

export type LLMError = Error & {
  name: string;
  message: string;
};

export type LLM = {
  invokeCompletion(
    messages: { role: string; content: any }[], model: string
  ): Promise<LLMCompletionResponse>;

  calculateCost(
    promptTokens: number,
    completionTokens: number,
    totalTokens: number,
    images?: { [key: string]: number | string }[],
    model?: string
  ): number;
};
