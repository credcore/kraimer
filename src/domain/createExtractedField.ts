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
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (extraction_id, name)
      DO UPDATE SET value = $3, strategy = $4, status = $5
      RETURNING id
    `,
    [extractionId, name, value, strategy, status]
  );
  return getExtractedField(result.id);
}