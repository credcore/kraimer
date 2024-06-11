import { getDb } from "../db/index.js";
import { Extraction } from "./Extraction.js";
import { getExtractionProperties } from "./getExtractionProperties.js";

export async function getExtractions(documentGroupId: number): Promise<Extraction[]> {
  const db = getDb();
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
    const extraction = new Extraction(
      result.id,
      result.document_group_id,
      result.name,
      result.status,
      result.created_at
    );

    extraction.properties = await getExtractionProperties(extraction.id);

    extractions.push(extraction);
  }

  return extractions;
}
