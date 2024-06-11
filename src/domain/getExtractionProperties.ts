import { getDb } from "../db/index.js";
import { ExtractionProperty } from "./ExtractionProperty.js";

export async function getExtractionProperties(extractionId: number): Promise<ExtractionProperty[]> {
  const db = getDb();
  const results = await db.manyOrNone(
    `
      SELECT id, extraction_id, name, value, created_at
      FROM extraction_property
      WHERE extraction_id = $<extractionId>
    `,
    { extractionId }
  );

  return results.map(
    (prop) =>
      new ExtractionProperty(
        prop.id,
        prop.extraction_id,
        prop.name,
        prop.value,
        prop.created_at
      )
  );
}
