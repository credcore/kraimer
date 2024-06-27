import { getDb } from "../db/index.js";
import { getExtractionProperty } from "./getExtractionProperty.js";
import { ExtractionProperty } from "./types.js";

export async function saveExtractionProperty(
  extractionId: number,
  name: string,
  value: string
): Promise<ExtractionProperty> {
  const db = await getDb();

  const existingProperty = await getExtractionProperty(extractionId, name).catch(() => null);

  if (existingProperty) {
    await db.none(
      `
        UPDATE extraction_property
        SET value = $<value>
        WHERE extraction_id = $<extractionId> AND name = $<name>
      `,
      { extractionId, name, value }
    );
  } else {
    await db.none(
      `
        INSERT INTO extraction_property (extraction_id, name, value)
        VALUES ($<extractionId>, $<name>, $<value>)
      `,
      { extractionId, name, value }
    );
  }

  return getExtractionProperty(extractionId, name);
}
