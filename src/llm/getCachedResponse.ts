import { getConnection } from '../db/getConnection';
import { debugPrint } from '../logger/debugPrint';
import { LLMCompletionResponse } from './llmTypes';

export const getCachedResponse = async (promptHash: string, model?: string, llm?: string): Promise<LLMCompletionResponse | null> => {
  const connection = await getConnection();
  const cursor = connection.cursor();

  let query = `
    SELECT id, llm, model, prompt_hash, prompt, response_id, response,
           finish_reason, prompt_tokens, completion_tokens, total_tokens,
           error, created_at
    FROM llm_response
    WHERE prompt_hash = $1
  `;

  const params: any[] = [promptHash];

  if (model) {
    query += ' AND model = $2';
    params.push(model);
  }

  if (llm) {
    query += ' AND llm = $3';
    params.push(llm);
  }

  const result = await cursor.execute(query, params);
  const row = result.rows[0];

  if (!row) return null;

  const llmResponse: LLMCompletionResponse = {
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
    error: row.error,
  };

  debugPrint(`Fetch from LLM Response Cache: id=${row.id}`);

  return llmResponse;
};
