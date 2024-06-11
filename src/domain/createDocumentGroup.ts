import { getDb } from "../db/index.js";
import { DocumentGroup } from "./DocumentGroup.js";
import { getDocumentGroup } from "./getDocumentGroup.js";

export async function createDocumentGroup(
  name: string,
  description: string
): Promise<DocumentGroup> {
  const db = getDb();
  const result = await db.one(
    `
      INSERT INTO document_group (name, description)
      VALUES ($1, $2)
      RETURNING id
    `,
    [name, description]
  );
  return getDocumentGroup(result.id);
}