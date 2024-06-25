import * as fs from "fs/promises";
import * as os from "os";
import * as path from "path";
import { getDb } from "../db/index.js";

export async function saveFileContent(
  fileContentId: number,
  filePath: string | undefined = undefined
): Promise<string> {
  const db = await getDb();
  const fileContentResult = await db.oneOrNone(
    `
      SELECT content
      FROM file_content
      WHERE id = $<fileContentId>
    `,
    { fileContentId }
  );

  if (!fileContentResult) {
    throw new Error(`No file content found with id: ${fileContentId}`);
  }

  const filePathToSave =
    filePath ?? path.join(os.tmpdir(), `temp-${Date.now()}.tmp`);
  await fs.writeFile(filePathToSave, fileContentResult.content);

  return filePathToSave;
}
