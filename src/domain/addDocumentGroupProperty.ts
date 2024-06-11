import { getDb } from "../db/index.js";
import { getDocumentGroupProperty } from "./getDocumentGroupProperty.js";
import { DocumentGroupProperty } from "./types.js";

export async function addDocumentGroupProperty(
  documentGroupId: number,
  name: string,
  value: string
): Promise<DocumentGroupProperty> {
  const db = getDb();
  await db.none(
    `
      INSERT INTO document_group_property (document_group_id, name, value)
      VALUES ($<documentGroupId>, $<name>, $<value>)
    `,
    { documentGroupId, name, value }
  );
  return getDocumentGroupProperty(documentGroupId, name);
}
