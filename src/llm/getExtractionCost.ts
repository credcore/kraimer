import { getDb } from "../db/index.js";

export async function getExtractionCost(extractionId: number): Promise<number> {
  const db = await getDb();

  const result = await db.oneOrNone(
    `
      SELECT COALESCE(SUM(cost), 0) as totalCost
      FROM llm_response
      WHERE extraction_id = $<extractionId>
    `,
    { extractionId }
  );

  if (!result) {
    throw new Error(
      `Failed to retrieve cost for extraction with id ${extractionId}`
    );
  }

  return result.totalCost;
}
