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
      VALUES ($1, $2, $3)
      RETURNING id
    `,
    [filePath, content, "any"]
  );

  const documentResult = await db.one(
    `
      INSERT INTO document (name, description, type, file_content_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `,
    [name, description, type, fileContentResult.id]
  );

  return getDocument(documentResult.id);
}