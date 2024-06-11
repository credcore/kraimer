import { getDb } from "../db/index.js";
import { ExtractedField } from "./types.js";

export async function getExtractedFields(
  extractionId: number
): Promise<ExtractedField[]> {
  const db = getDb();
  const results = await db.manyOrNone(
    `
      SELECT id, extraction_id, name, value, strategy, status, created_at
      FROM extracted_field
      WHERE extraction_id = $<extractionId>
      ORDER BY id ASC
    `,
    { extractionId }
  );

  return results.map((field) => ({
    id: field.id,
    extractionId: field.extraction_id,
    name: field.name,
    value: field.value,
    strategy: field.strategy,
    status: field.status,
    createdAt: field.created_at,
  }));
}
