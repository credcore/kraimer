import { getDb } from "../db/index.js";
import { ExtractionProperty } from "./types.js";

export async function getExtractionProperty(
  extractionId: number,
  name: string
): Promise<ExtractionProperty> {
  const db = await getDb();
  const result = await db.oneOrNone(
    `
      SELECT id, extraction_id, name, value, created_at
      FROM extraction_property
      WHERE extraction_id = $<extractionId> AND name = $<name>
    `,
    { extractionId, name }
  );

  if (!result) {
    throw new Error(
      `Cannot find ExtractionProperty ${name} in Extraction ${extractionId}`
    );
  }

  return {
    id: result.id,
    extractionId: result.extraction_id,
    name: result.name,
    value: result.value,
    createdAt: result.created_at,
  };
}
