import { getDb } from "../db/index.js";
import { getExtractedField } from "./getExtractedField.js";
import { ExtractedField, TaskStatusEnum } from "./types.js";

export async function createExtractedField(
  extractionId: number,
  name: string,
  value: string,
  session: string,
  strategy: string,
  status: TaskStatusEnum
): Promise<ExtractedField> {
  const db = getDb();
  const result = await db.one(
    `
      INSERT INTO extracted_field (extraction_id, name, value, strategy, status, session)
      VALUES ($<extractionId>, $<name>, $<value>, $<strategy>, $<status>, $<session>)
      ON CONFLICT (extraction_id, name)
      DO UPDATE SET value = $<value>, strategy = $<strategy>, status = $<status>, session = $<session>
      RETURNING id
    `,
    { extractionId, name, value, strategy, status, session }
  );
  return getExtractedField(result.id);
}
