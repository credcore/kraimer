import { getDb } from "../db/index.js";
import { ExtractedFieldError } from "./ExtractedFieldError.js";

export async function getExtractedFieldErrors(
  extractionId: number,
  extractedFieldId?: number
): Promise<ExtractedFieldError[]> {
  const db = getDb();
  let query = `
    SELECT id, extraction_id, extracted_field_id, message, data, created_at
    FROM extracted_field_error
    WHERE extraction_id = $<extractionId>
  `;
  const values: any = { extractionId };

  if (extractedFieldId) {
    query += ` AND extracted_field_id = $<extractedFieldId>`;
    values.extractedFieldId = extractedFieldId;
  }

  const results = await db.manyOrNone(query, values);

  return results.map(
    (error) =>
      new ExtractedFieldError(
        error.id,
        error.extraction_id,
        error.extracted_field_id,
        error.message,
        error.data,
        error.created_at
      )
  );
}
