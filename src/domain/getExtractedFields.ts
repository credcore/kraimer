import { getDb } from "../db/index.js";
import { ExtractedField } from "./ExtractedField.js";

export async function getExtractedFields(extractionId: number): Promise<ExtractedField[]> {
  const db = getDb();
  const results = await db.manyOrNone(
    `
      SELECT id, extraction_id, name, value, strategy, status, created_at
      FROM extracted_field
      WHERE extraction_id = $1
      ORDER BY id ASC
    `,
    [extractionId]
  );

  return results.map(
    (field) =>
      new ExtractedField(
        field.id,
        field.extraction_id,
        field.name,
        field.value,
        field.strategy,
        field.status,
        field.created_at
      )
  );
}