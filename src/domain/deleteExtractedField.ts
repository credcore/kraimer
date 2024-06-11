import { getDb } from "../db/index.js";

export async function deleteExtractedField(id: number): Promise<void> {
  const db = getDb();
  await db.none(
    `
      DELETE FROM extracted_field
      WHERE id = $1
    `,
    [id]
  );
}