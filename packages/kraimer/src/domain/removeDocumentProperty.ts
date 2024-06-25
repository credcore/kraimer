import { getDb } from "../db/index.js";

export async function removeDocumentProperty(documentId: number, name: string): Promise<void> {
  const db = await getDb();
  await db.none(
    `
      DELETE FROM document_property
      WHERE document_id = $<documentId> AND name = $<name>
    `,
    { documentId, name }
  );
}
