import { getDb } from "../db/index.js";

export async function deleteDocumentGroup(id: number): Promise<void> {
  const db = getDb();
  await db.none(
    `
      DELETE FROM document_group_property
      WHERE document_group_id = $1
    `,
    [id]
  );
  await db.none(
    `
      DELETE FROM document_group_document
      WHERE document_group_id = $1
    `,
    [id]
  );
  await db.none(
    `
      DELETE FROM document_group
      WHERE id = $1
    `,
    [id]
  );
}