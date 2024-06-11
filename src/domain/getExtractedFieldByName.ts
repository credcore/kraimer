import { getDb } from "../db/index.js";
import { ExtractedField, TaskStatusEnum } from "./types.js";

export async function getExtractedFieldByName(
  extractionId: number,
  name: string
): Promise<ExtractedField> {
  const db = getDb();
  const result = await db.oneOrNone(
    `
      SELECT id, extraction_id, name, value, strategy, status, created_at
      FROM extracted_field
      WHERE extraction_id = $<extractionId> AND name = $<name>
    `,
    { extractionId, name }
  );

  if (!result) {
    throw new Error(
      `Cannot find ExtractedField ${name} in Extraction ${extractionId}`
    );
  }

  return {
    id: result.id,
    extractionId: result.extraction_id,
    name: result.name,
    value: result.value,
    strategy: result.strategy,
    status: result.status as TaskStatusEnum,
    createdAt: result.created_at,
  };
}
