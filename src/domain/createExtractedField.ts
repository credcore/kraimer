import { getDb } from "../db/index.js";
import { getExtractedField } from "./getExtractedField.js";
import { ExtractedField, TaskStatusEnum } from "./types.js";

export async function createExtractedField(
  extractionId: number,
  name: string,
  value: string,
  strategy: string,
  status: TaskStatusEnum
): Promise<ExtractedField> {
  const db = await getDb();
  const result = await db.one(
    `
      INSERT INTO extracted_field (extraction_id, name, value, strategy, status)
      VALUES ($<extractionId>, $<name>, $<value>, $<strategy>, $<status>)
      RETURNING id
    `,
    { extractionId, name, value, strategy, status }
  );
  return getExtractedField(result.id);
}
