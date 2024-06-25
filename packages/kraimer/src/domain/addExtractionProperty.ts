import { getDb } from "../db/index.js";
import { getExtractionProperty } from "./getExtractionProperty.js";
import { ExtractionProperty } from "./types.js";

export async function addExtractionProperty(
  extractionId: number,
  name: string,
  value: string
): Promise<ExtractionProperty> {
  const db = await getDb();
  await db.none(
    `
      INSERT INTO extraction_property (extraction_id, name, value)
      VALUES ($<extractionId>, $<name>, $<value>)
    `,
    { extractionId, name, value }
  );
  return getExtractionProperty(extractionId, name);
}
