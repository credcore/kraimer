import { getDb } from "../db/index.js";
import { LLMResponse } from "./types.js";

export async function saveResponse(llmResponse: LLMResponse): Promise<number> {
  const db = await getDb();

  const query = `
    INSERT INTO llm_response (
      llm, model, prompt_hash, prompt, response_id, response,
      finish_reason, prompt_tokens, completion_tokens, total_tokens, cost, error, extraction_id
    )
    VALUES (
      $<llm>, $<model>, $<promptHash>, $<prompt>,
      $<responseId>, $<response>, $<finishReason>, 
      $<promptTokens>, $<completionTokens>, $<totalTokens>, 
      $<cost>, $<error>, $<extractionId>
    )    
    RETURNING id
  `;

  const result = await db.one(query, llmResponse);

  return result.id;
}
