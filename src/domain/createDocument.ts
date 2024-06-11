import { getDb } from "../db/index.js";
import { getDocument } from "./getDocument.js";
import { Document } from "./types.js";
import { promises as fs } from "fs";

export async function createDocument(
  name: string,
  description: string,
  type: string,
  filePath: string
): Promise<Document> {
  const db = await getDb();
  const content = await fs.readFile(filePath);

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
