import { getDb } from "../db/index.js";
import { ExtractedField } from "./ExtractedField.js";

export async function getExtractedField(id: number): Promise<ExtractedField | null> {
  const db = getDb();
  const result = await db.oneOrNone(
    `
      SELECT id, extraction_id, name, value, strategy, status, created_at
      FROM extracted_field
      WHERE id = $<id>
    `,
    { id }
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
    result.status,
    result.created_at
  );
}
