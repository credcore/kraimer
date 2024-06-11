import { getDb } from "../db/index.js";

export async function removeDocumentProperty(documentId: number, name: string): Promise<void> {
  const db = getDb();
  await db.none(
    `
      DELETE FROM document_property
      WHERE document_id = $1 AND name = $2
    `,
    [documentId, name]
  );
}