import { getDb } from "../db/index.js";
import { ExtractedFieldError } from "./ExtractedFieldError.js";
import { getExtractedFieldError } from "./getExtractedFieldError.js";

export async function createExtractedFieldError(
  extractionId: number,
  extractedFieldId: number,
  message: string,
  data: string
): Promise<ExtractedFieldError> {
  const db = getDb();
  const result = await db.one(
    `
      INSERT INTO extracted_field_error (extraction_id, extracted_field_id, message, data)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `,
    [extractionId, extractedFieldId, message, data]
  );
  return getExtractedFieldError(result.id);
}