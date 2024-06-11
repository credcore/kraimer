import { getDb } from "../db/index.js";
import { DocumentProperty } from "./DocumentProperty.js";

export async function getDocumentProperty(
  documentId: number,
  name: string
): Promise<DocumentProperty | null> {
  const db = getDb();
  const result = await db.oneOrNone(
    `
      SELECT id, document_id, name, value, created_at
      FROM document_property
      WHERE document_id = $1 AND name = $2
    `,
    [documentId, name]
  );

  if (!result) {
    return null;
  }

  return new DocumentProperty(
    result.id,
    result.document_id,
    result.name,
    result.value,
    result.created_at
  );
}