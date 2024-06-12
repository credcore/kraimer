import { getConnection } from '../db/getConnection';
import { debugPrint } from '../logger/debugPrint';
import { LLMCompletionResponse } from './llmTypes';

export const cacheResponse = async (llmResponse: LLMCompletionResponse) => {
  const connection = await getConnection();
  const cursor = connection.cursor();

  const query = `
    INSERT INTO llm_response (
      llm, model, prompt_hash, prompt, response_id, response,
      finish_reason, prompt_tokens, completion_tokens, total_tokens, error
    )
    VALUES (
      ${llmResponse.llm}, ${llmResponse.model}, ${llmResponse.promptHash}, ${llmResponse.prompt},
      ${llmResponse.responseId}, ${llmResponse.response}, ${llmResponse.finishReason}, 
      ${llmResponse.promptTokens}, ${llmResponse.completionTokens}, ${llmResponse.totalTokens}, 
      ${llmResponse.error}
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
    RETURNING id
  `;

  const result = await cursor.execute(query);
  const entryId = result.rows[0].id;

  debugPrint(`Added to LLM Response Cache: id=${entryId}`);

  await connection.commit();
  await cursor.close();
  await connection.close();
};
