import { getDb } from "../db/index.js";

export async function removeDocumentGroupProperty(documentGroupId: number, name: string): Promise<void> {
  const db = getDb();
  await db.none(
    `
      DELETE FROM document_group_property
      WHERE document_group_id = $1 AND name = $2
    `,
    [documentGroupId, name]
  );
}