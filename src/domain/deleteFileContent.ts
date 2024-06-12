import { getDb } from "../db/index.js";

export async function deleteFileContent(id: number): Promise<void> {
  const db = await getDb();
  await db.none(
    `
      DELETE FROM file_content
      WHERE id = $<id>  
    `,
    { id }
  );
}
