import { getDb } from "../db/index.js";
import { getDocumentProperties } from "./getDocumentProperties.js";
import { Document } from "./types.js";

export async function getDocument(id: number): Promise<Document> {
  const db = getDb();
  const result = await db.oneOrNone(
    `
      SELECT id, name, description, type, file_content_id, created_at
      FROM document
      WHERE id = $<id>
    `,
    { id }
  );

  if (!result) {
    throw new Error(`Cannot find Document with id ${id}`);
  }

  const document: Document = {
    id: result.id,
    name: result.name,
    description: result.description,
    type: result.type,
    fileContentId: result.file_content_id,
    createdAt: result.created_at,
    properties: [],
  };

  document.properties = await getDocumentProperties(id);

  return document;
}
