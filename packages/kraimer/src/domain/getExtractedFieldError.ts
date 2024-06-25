import { getDb } from "../db/index.js";
import { ExtractedFieldError } from "./types.js";

export async function getExtractedFieldError(
  id: number
): Promise<ExtractedFieldError> {
  const db = await getDb();
  const result = await db.oneOrNone(
    `
      SELECT id, extraction_id, extracted_field_id, message, data, created_at
      FROM extracted_field_error
      WHERE id = $<id>
    `,
    { id }
  );

  if (!result) {
    throw new Error(`Cannot find ExtractedFieldError with id ${id}`);
  }

  return {
    id: result.id,
    extractedFieldId: result.extracted_field_id,
    message: result.message,
    data: result.data,
    createdAt: result.created_at,
  };
}
