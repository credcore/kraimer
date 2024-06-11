import { getDb } from "../db/index.js";
import { Document } from "./Document.js";
import { getDocument } from "./getDocument.js";

export async function createDocument(
  name: string,
  description: string,
  type: string,
  filePath: string
): Promise<Document> {
  const db = getDb();
  const content = await fs.promises.readFile(filePath);

  const fileContentResult = await db.one(
    `
      INSERT INTO file_content (file_path, content, content_type)
      VALUES ($<filePath>, $<content>, $<contentType>)
      RETURNING id
    `,
    { filePath, content, contentType: "any" }
  );

  const documentResult = await db.one(
    `
      INSERT INTO document (name, description, type, file_content_id)
      VALUES ($<name>, $<description>, $<type>, $<fileContentId>)
      RETURNING id
    `,
    { name, description, type, fileContentId: fileContentResult.id }
  );

  return getDocument(documentResult.id);
}
