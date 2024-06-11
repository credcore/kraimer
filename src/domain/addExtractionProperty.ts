import { getDb } from "../db/index.js";
import { ExtractionProperty } from "./ExtractionProperty.js";
import { getExtractionProperty } from "./getExtractionProperty.js";

export async function addExtractionProperty(
  extractionId: number,
  name: string,
  value: string
): Promise<ExtractionProperty> {
  const db = getDb();
  await db.none(
    `
      INSERT INTO extraction_property (extraction_id, name, value)
      VALUES ($1, $2, $3)
    `,
    [extractionId, name, value]
  );
  return getExtractionProperty(extractionId, name);
}