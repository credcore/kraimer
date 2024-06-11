import { getDb } from "../db/index.js";
import { ExtractedField } from "./ExtractedField.js";
import { getExtractedField } from "./getExtractedField.js";
import { TaskStatusEnum } from "./TaskStatusEnum.js";

export async function createExtractedField(
  extractionId: number,
  name: string,
  value: string,
  strategy: string,
  status: TaskStatusEnum
): Promise<ExtractedField> {
  const db = getDb();
  const result = await db.one(
    `
      INSERT INTO extracted_field (extraction_id, name, value, strategy, status)
      VALUES ($<extractionId>, $<name>, $<value>, $<strategy>, $<status>)
      ON CONFLICT (extraction_id, name)
      DO UPDATE SET value = $<value>, strategy = $<strategy>, status = $<status>
      RETURNING id
    `,
    { extractionId, name, value, strategy, status }
  );
  return getExtractedField(result.id);
}
