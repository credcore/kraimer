import { getDb } from "../db/index.js";

export async function deleteExtraction(id: number): Promise<void> {
  const db = getDb();
  await db.none(
    `
      DELETE FROM extraction_property
      WHERE extraction_id = $1
    `,
    [id]
  );
  await db.none(
    `
      DELETE FROM extraction
      WHERE id = $1
    `,
    [id]
  );
}