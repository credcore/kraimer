import { getDb } from "../db/index.js";

export async function deleteExtraction(id: number): Promise<void> {
  const db = await getDb();
  await db.none(
    `
      DELETE FROM extraction_property
      WHERE extraction_id = $<id>
    `,
    { id }
  );
  await db.none(
    `
      DELETE FROM extraction
      WHERE id = $<id>
    `,
    { id }
  );
}
