import { getDb } from "../db/index.js";
import { Document } from "./Document.js";
import { getDocumentProperties } from "./getDocumentProperties.js";

export async function getDocument(id: number): Promise<Document | null> {
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
    return null;
  }

  const document = new Document(
    result.id,
    result.name,
    result.description,
    result.type,
    result.file_content_id,
    result.created_at
  );

  document.properties = await getDocumentProperties(id);

  return document;
}
