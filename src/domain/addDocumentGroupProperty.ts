import { getDb } from "../db/index.js";
import { DocumentGroupProperty } from "./DocumentGroupProperty.js";
import { getDocumentGroupProperty } from "./getDocumentGroupProperty.js";

export async function addDocumentGroupProperty(
  documentGroupId: number,
  name: string,
  value: string
): Promise<DocumentGroupProperty> {
  const db = getDb();
  await db.none(
    `
      INSERT INTO document_group_property (document_group_id, name, value)
      VALUES ($1, $2, $3)
    `,
    [documentGroupId, name, value]
  );
  return getDocumentGroupProperty(documentGroupId, name);
}