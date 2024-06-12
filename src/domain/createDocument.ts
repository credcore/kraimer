import { getDb } from "../db/index.js";
import { getDocument } from "./getDocument.js";
import { Document } from "./types.js";
import { createFileContent } from "./createFileContent.js";

export async function createDocument(
  name: string,
  description: string,
  type: string,
  filePath: string
): Promise<Document> {
  const db = await getDb();

  const fileContent = await createFileContent(filePath, "any");

  const documentResult = await db.one(
    `
      INSERT INTO document (name, description, type, file_content_id)
      VALUES ($<name>, $<description>, $<type>, $<fileContentId>)
      RETURNING id
    `,
    { name, description, type, fileContentId: fileContent.id }
  );

  return getDocument(documentResult.id);
}
