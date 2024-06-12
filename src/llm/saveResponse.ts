import { getDb } from "../db/index.js";
import { LLMResponse } from "./types.js";

export async function saveResponse(llmResponse: LLMResponse): Promise<number> {
  const db = await getDb();

  const query = `
    INSERT INTO llm_response (
      llm, model, prompt_hash, prompt, response_id, response,
      finish_reason, prompt_tokens, completion_tokens, total_tokens, cost, error
    )
    VALUES (
      $<llm>, $<model>, $<promptHash>, $<prompt>,
      $<responseId>, $<response>, $<finishReason>, 
      $<promptTokens>, $<completionTokens>, $<totalTokens>, 
      $<cost>, $<error>
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
      cost = EXCLUDED.cost,
      error = EXCLUDED.error
    RETURNING id
  `;

  const result = await db.one(query, llmResponse);

  return result.id;
}
