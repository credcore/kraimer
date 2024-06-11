import { getDb } from "../db/index.js";
import { getExtractionProperties } from "./getExtractionProperties.js";
import { Extraction } from "./types.js";

export async function getExtraction(id: number): Promise<Extraction> {
  const db = await getDb();
  const result = await db.oneOrNone(
    `
      SELECT id, document_group_id, name, status, created_at
      FROM extraction
      WHERE id = $<id>
    `,
    { id }
  );

  if (!result) {
    throw new Error(`Cannot find Extraction with id ${id}`);
  }

  const extraction: Extraction = {
    id: result.id,
    documentGroupId: result.document_group_id,
    name: result.name,
    status: result.status,
    createdAt: result.created_at,
    properties: [],
  };

  extraction.properties = await getExtractionProperties(extraction.id);

  return extraction;
}
