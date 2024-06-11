import { getDb } from "../db/index.js";
import { DocumentProperty } from "./DocumentProperty.js";

export async function getDocumentProperties(documentId: number): Promise<DocumentProperty[]> {
  const db = getDb();
  const results = await db.manyOrNone(
    `
      SELECT id, document_id, name, value, created_at
      FROM document_property
      WHERE document_id = $<documentId>
    `,
    { documentId }
  );

  return results.map(
    (prop) =>
      new DocumentProperty(
        prop.id,
        prop.document_id,
        prop.name,
        prop.value,
        prop.created_at
      )
  );
}
