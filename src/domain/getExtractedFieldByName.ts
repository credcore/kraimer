import { getDb } from "../db/index.js";
import { ExtractedField } from "./ExtractedField.js";
import { TaskStatusEnum } from "./TaskStatusEnum.js";

export async function getExtractedFieldByName(
  extractionId: number,
  name: string
): Promise<ExtractedField | null> {
  const db = getDb();
  const result = await db.oneOrNone(
    `
      SELECT id, extraction_id, name, value, strategy, status, created_at
      FROM extracted_field
      WHERE extraction_id = $1 AND name = $2
    `,
    [extractionId, name]
  );

  if (!result) {
    return null;
  }

  return new ExtractedField(
    result.id,
    result.extraction_id,
    result.name,
    result.value,
    result.strategy,
    result.status as TaskStatusEnum,
    result.created_at
  );
}
