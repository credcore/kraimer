import { getDb } from "../db/index.js";

export async function getExtractionCost(extractionId: number): Promise<number> {
  const db = await getDb();

  const result = await db.oneOrNone(
    `
      SELECT SUM(lr.cost) as total_cost
      FROM llm_response lr
      JOIN llm_cost lc ON lr.id = lc.llm_response_id
      WHERE lc.extraction_id = $<extractionId>
    `,
    { extractionId }
  );

  if (!result || result.total_cost === null) {
    return 0;
  }

  return parseFloat(result.total_cost);
}
