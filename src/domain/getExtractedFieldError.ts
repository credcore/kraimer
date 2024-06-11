import { getDb } from "../db/index.js";
import { ExtractedFieldError } from "./ExtractedFieldError.js";

export async function getExtractedFieldError(id: number): Promise<ExtractedFieldError | null> {
  const db = getDb();
  const result = await db.oneOrNone(
    `
      SELECT id, extraction_id, extracted_field_id, message, data, created_at
      FROM extracted_field_error
      WHERE id = $1
    `,
    [id]
  );

  if (!result) {
    return null;
  }

  return new ExtractedFieldError(
    result.id,
    result.extraction_id,
    result.extracted_field_id,
    result.message,
    result.data,
    result.created_at
  );
}