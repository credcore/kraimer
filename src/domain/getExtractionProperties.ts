import { getDb } from "../db/index.js";
import { ExtractionProperty } from "./types.js";

export async function getExtractionProperties(
  extractionId: number
): Promise<ExtractionProperty[]> {
  const db = getDb();
  const results = await db.manyOrNone(
    `
      SELECT id, extraction_id, name, value, created_at
      FROM extraction_property
      WHERE extraction_id = $<extractionId>
    `,
    { extractionId }
  );

  return results.map((prop) => ({
    id: prop.id,
    extractionId: prop.extraction_id,
    name: prop.name,
    value: prop.value,
    createdAt: prop.created_at,
  }));
}
