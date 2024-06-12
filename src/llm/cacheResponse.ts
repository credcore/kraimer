import { getDb } from "../db/index.js";
import { debugPrint } from "../logger/log.js";
import { LLMCompletionResponse } from "./types.js";

export const cacheResponse = async (llmResponse: LLMCompletionResponse) => {
  const db = await getDb();

  const query = `
    INSERT INTO llm_response (
      llm, model, prompt_hash, prompt, response_id, response,
      finish_reason, prompt_tokens, completion_tokens, total_tokens, error
    )
    VALUES (
      $<llm>, $<model>, $<promptHash>, $<prompt>,
      $<responseId>, $<response>, $<finishReason>, 
      $<promptTokens>, $<completionTokens>, $<totalTokens>, 
      $<error>
    )
    ON CONFLICT (llm, model, prompt_hash)
    DO UPDATE SET
      prompt = EXCLUDED.prompt,
      response_id = EXCLUDED.response_id,
      response = EXCLUDED.response,
      finish_reason = EXCLUDED.finish_reason,
      prompt_tokens = EXCLUDED.prompt_tokens,
      completion_tokens = EXCLUDED.completion_tokens,
      total_tokens = EXCLUDED.total_tokens,
      error = EXCLUDED.error
  `;

  await db.none(query, llmResponse);

  debugPrint(
    `Added to LLM Response Cache: promptHash=${llmResponse.promptHash}`
  );
};
