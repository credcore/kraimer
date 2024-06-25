import { getDb } from "../db/index.js";

export async function deleteDocumentGroup(id: number): Promise<void> {
  const db = await getDb();
  await db.none(
    `
      DELETE FROM document_group_property
      WHERE document_group_id = $<id>
    `,
    { id }
  );
  await db.none(
    `
      DELETE FROM document_group_document
      WHERE document_group_id = $<id>
    `,
    { id }
  );
  await db.none(
    `
      DELETE FROM document_group
      WHERE id = $<id>
    `,
    { id }
  );
}
