import { getDb } from "../db/index.js";

export async function removeDocumentGroupProperty(documentGroupId: number, name: string): Promise<void> {
  const db = await getDb();
  await db.none(
    `
      DELETE FROM document_group_property
      WHERE document_group_id = $<documentGroupId> AND name = $<name>
    `,
    { documentGroupId, name }
  );
}
