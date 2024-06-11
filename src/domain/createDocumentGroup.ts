import { getDb } from "../db/index.js";
import { getDocumentGroup } from "./getDocumentGroup.js";
import { DocumentGroup } from "./types.js";

export async function createDocumentGroup(
  name: string,
  description: string
): Promise<DocumentGroup> {
  const db = getDb();
  const result = await db.one(
    `
      INSERT INTO document_group (name, description)
      VALUES ($<name>, $<description>)
      RETURNING id
    `,
    { name, description }
  );
  return getDocumentGroup(result.id);
}
