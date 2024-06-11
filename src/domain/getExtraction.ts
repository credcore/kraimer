import { getDb } from "../db/index.js";
import { Extraction } from "./Extraction.js";
import { getExtractionProperties } from "./getExtractionProperties.js";

export async function getExtraction(id: number): Promise<Extraction | null> {
  const db = getDb();
  const result = await db.oneOrNone(
    `
      SELECT id, document_group_id, name, status, created_at
      FROM extraction
      WHERE id = $1
    `,
    [id]
  );

  if (!result) {
    return null;
  }

  const extraction = new Extraction(
    result.id,
    result.document_group_id,
    result.name,
    result.status,
    result.created_at
  );

  extraction.properties = await getExtractionProperties(extraction.id);

  return extraction;
}