import { promises as fs } from "fs";
import { getDb } from "../db/index.js";
import { FileContent } from "./types.js";

export async function createFileContent(
  filePath: string,
  contentType: string
): Promise<FileContent> {
  const db = await getDb();
  const content = await fs.readFile(filePath);

  const result = await db.one(
    `
      INSERT INTO file_content (file_path, content, content_type)
      VALUES ($<filePath>, $<content>, $<contentType>)
      RETURNING id
    `,
    { filePath, content, contentType }
  );

  return {
    id: result.id,
    filePath,
  };
}
