import { getDb } from "../db/index.js";
import { DocumentProperty } from "./types.js";

export async function getDocumentProperty(
  documentId: number,
  name: string
): Promise<DocumentProperty> {
  const db = await getDb();
  const result = await db.oneOrNone(
    `
      SELECT id, document_id, name, value, created_at
      FROM document_property
      WHERE document_id = $<documentId> AND name = $<name>
    `,
    { documentId, name }
  );

  if (!result) {
    throw new Error(
      `Cannot find DocumentProperty with name ${name} in Document ${documentId}`
    );
  }

  return {
    id: result.id,
    documentId: result.document_id,
    name: result.name,
    value: result.value,
    createdAt: result.created_at,
  };
}
