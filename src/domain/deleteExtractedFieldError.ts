import { getDb } from "../db/index.js";

export async function deleteExtractedFieldError(id: number): Promise<void> {
  const db = getDb();
  await db.none(
    `
      DELETE FROM extracted_field_error
      WHERE id = $<id>
    `,
    { id }
  );
}
