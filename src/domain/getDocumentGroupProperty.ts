import { getDb } from "../db/index.js";
import { DocumentGroupProperty } from "./DocumentGroupProperty.js";

export async function getDocumentGroupProperty(
  documentGroupId: number,
  name: string
): Promise<DocumentGroupProperty | null> {
  const db = getDb();
  const result = await db.oneOrNone(
    `
      SELECT id, document_group_id, name, value, created_at
      FROM document_group_property
      WHERE document_group_id = $1 AND name = $2
    `,
    [documentGroupId, name]
  );

  if (!result) {
    return null;
  }

  return new DocumentGroupProperty(
    result.id,
    result.document_group_id,
    result.name,
    result.value,
    result.created_at
  );
}