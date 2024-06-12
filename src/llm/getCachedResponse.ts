import { getDb } from "../db/index.js";
import { LLMResponse } from "./types.js";

export const getCachedResponse = async (
  promptHash: string,
  model?: string,
  llm?: string
): Promise<LLMResponse | null> => {
  const db = await getDb();

  let query = `
    SELECT id, llm, model, prompt_hash, prompt, response_id, response,
           finish_reason, prompt_tokens, completion_tokens, total_tokens,
           error, created_at
    FROM llm_response
    WHERE prompt_hash = $<promptHash>
  `;

  const params: { [key: string]: any } = { promptHash };

  if (model) {
    query += " AND model = $<model>";
    params.model = model;
  }

  if (llm) {
    query += " AND llm = $<llm>";
    params.llm = llm;
  }

  const row = await db.oneOrNone(query, params);

  if (!row) return null;

  const llmResponse: LLMResponse = {
    llm: row.llm,
    model: row.model,
    promptHash: row.prompt_hash,
    prompt: row.prompt,
    responseId: row.response_id,
    response: row.response,
    finishReason: row.finish_reason,
    promptTokens: row.prompt_tokens,
    completionTokens: row.completion_tokens,
    totalTokens: row.total_tokens,
    cost: 0,
    error: row.error,
  };

  return llmResponse;
};
