import { getDb } from "../db/index.js";
import { ExtractedFieldError } from "./types.js";

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

  return results.map((error) => ({
    id: error.id,
    extractionId: error.extraction_id,
    extractedFieldId: error.extracted_field_id,
    message: error.message,
    data: error.data,
    createdAt: error.created_at,
  }));
}
