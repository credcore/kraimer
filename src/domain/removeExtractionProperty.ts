import { getDb } from "../db/index.js";

export async function removeExtractionProperty(extractionId: number, name: string): Promise<void> {
  const db = getDb();
  await db.none(
    `
      DELETE FROM extraction_property
      WHERE extraction_id = $1 AND name = $2
    `,
    [extractionId, name]
  );
}