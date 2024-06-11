import { getDb } from "../db/index.js";

export async function deleteExtractedField(id: number): Promise<void> {
  const db = await getDb();
  await db.none(
    `
      DELETE FROM extracted_field
      WHERE id = $<id>
    `,
    { id }
  );
}
