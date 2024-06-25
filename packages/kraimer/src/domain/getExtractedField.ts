import { getDb } from "../db/index.js";
import { ExtractedField } from "./types.js";

export async function getExtractedField(id: number): Promise<ExtractedField> {
  const db = await getDb();
  const result = await db.oneOrNone(
    `
      SELECT id, extraction_id, name, value, strategy, status, created_at
      FROM extracted_field
      WHERE id = $<id>
    `,
    { id }
  );

  if (!result) {
    throw new Error(`Cannot find ExtractedField with id ${id}`);
  }

  return {
    id: result.id,
    extractionId: result.extraction_id,
    name: result.name,
    value: result.value,
    strategy: result.strategy,
    status: result.status,
    createdAt: result.created_at,
  };
}
