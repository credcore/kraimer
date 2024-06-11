import { getDb } from "../db/index.js";
import { DocumentProperty } from "./DocumentProperty.js";
import { getDocumentProperty } from "./getDocumentProperty.js";

export async function addDocumentProperty(
  documentId: number,
  name: string,
  value: string
): Promise<DocumentProperty> {
  const db = getDb();
  await db.none(
    `
      INSERT INTO document_property (document_id, name, value)
      VALUES ($1, $2, $3)
    `,
    [documentId, name, value]
  );
  return getDocumentProperty(documentId, name);
}