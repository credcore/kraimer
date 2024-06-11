import { getDb } from "../db/index.js";

export async function deleteDocument(id: number): Promise<void> {
  const db = await getDb();
  await db.none(
    `
      DELETE FROM document_property
      WHERE document_id = $<id>
    `,
    { id }
  );
  await db.none(
    `
      DELETE FROM document
      WHERE id = $<id>
    `,
    { id }
  );
}
