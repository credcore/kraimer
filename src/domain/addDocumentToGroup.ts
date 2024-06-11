import { getDb } from "../db/index.js";

export async function addDocumentToGroup(
  documentGroupId: number,
  documentId: number
): Promise<void> {
  const db = getDb();
  await db.none(
    `
      INSERT INTO document_group_document (document_group_id, document_id)
      VALUES ($1, $2)
    `,
    [documentGroupId, documentId]
  );
}