import { getDb } from "../db/index.js";
import { getDocumentProperty } from "./getDocumentProperty.js";
import { DocumentProperty } from "./types.js";

export async function addDocumentProperty(
  documentId: number,
  name: string,
  value: string
): Promise<DocumentProperty> {
  const db = getDb();
  await db.none(
    `
      INSERT INTO document_property (document_id, name, value)
      VALUES ($<documentId>, $<name>, $<value>)
    `,
    { documentId, name, value }
  );
  return getDocumentProperty(documentId, name);
}
