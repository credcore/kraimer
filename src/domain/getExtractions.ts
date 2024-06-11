import { getDb } from "../db/index.js";
import { getExtractionProperties } from "./getExtractionProperties.js";
import { Extraction } from "./types.js";

export async function getExtractions(
  documentGroupId: number
): Promise<Extraction[]> {
  const db = await getDb();
  const results = await db.manyOrNone(
    `
      SELECT id, document_group_id, name, status, created_at
      FROM extraction
      WHERE document_group_id = $<documentGroupId>
    `,
    { documentGroupId }
  );

  const extractions: Extraction[] = [];

  for (const result of results) {
    const extraction: Extraction = {
      id: result.id,
      documentGroupId: result.document_group_id,
      name: result.name,
      status: result.status,
      createdAt: result.created_at,
      properties: await getExtractionProperties(result.id),
    };

    extractions.push(extraction);
  }

  return extractions;
}
