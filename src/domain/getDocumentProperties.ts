import { getDb } from "../db/index.js";
import { DocumentProperty } from "./types.js";

export async function getDocumentProperties(
  documentId: number
): Promise<DocumentProperty[]> {
  const db = await getDb();
  const results = await db.manyOrNone(
    `
      SELECT id, document_id, name, value, created_at
      FROM document_property
      WHERE document_id = $<documentId>
    `,
    { documentId }
  );

  return results.map((prop) => ({
    id: prop.id,
    documentId: prop.document_id,
    name: prop.name,
    value: prop.value,
    createdAt: prop.created_at,
  }));
}
