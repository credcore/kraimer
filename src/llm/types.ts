export type LLMResponse = {
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
  extractionId: number;
};

export type LLMError = Error & {
  name: string;
  message: string;
};

export type LLM = {
  invokeCompletion(
    model: string,
    messages: Message[]
  ): Promise<Omit<LLMResponse, "extractionId" | "promptHash">>;

  calculateCost(
    model: string,
    promptTokens: number,
    completionTokens: number,
    totalTokens: number,
    messages: Message[]
  ): number;
};

export type MessageContent =
  | {
      type: "text";
      text: string;
    }
  | {
      type: "image_url";
      image_url: { url: string };
    };

export type Message = { role: string; content: string | MessageContent[] };
