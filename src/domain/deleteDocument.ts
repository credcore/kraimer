import { getDb } from "../db/index.js";

export async function deleteDocument(id: number): Promise<void> {
  const db = getDb();
  await db.none(
    `
      DELETE FROM document_property
      WHERE document_id = $1
    `,
    [id]
  );
  await db.none(
    `
      DELETE FROM document
      WHERE id = $1
    `,
    [id]
  );
}