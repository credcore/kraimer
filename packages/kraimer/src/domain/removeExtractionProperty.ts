import { getDb } from "../db/index.js";

export async function removeExtractionProperty(extractionId: number, name: string): Promise<void> {
  const db = await getDb();
  await db.none(
    `
      DELETE FROM extraction_property
      WHERE extraction_id = $<extractionId> AND name = $<name>
    `,
    { extractionId, name }
  );
}
