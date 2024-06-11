import { getDb } from "../db/index.js";
import { ExtractionProperty } from "./ExtractionProperty.js";

export async function getExtractionProperty(
  extractionId: number,
  name: string
): Promise<ExtractionProperty | null> {
  const db = getDb();
  const result = await db.oneOrNone(
    `
      SELECT id, extraction_id, name, value, created_at
      FROM extraction_property
      WHERE extraction_id = $1 AND name = $2
    `,
    [extractionId, name]
  );

  if (!result) {
    return null;
  }

  return new ExtractionProperty(
    result.id,
    result.extraction_id,
    result.name,
    result.value,
    result.created_at
  );
}