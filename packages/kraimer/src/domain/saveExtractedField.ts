import { getDb } from "../db/index.js";
import { getExtractedField } from "./getExtractedField.js";
import { getExtractedFieldByName } from "./getExtractedFieldByName.js";
import { ExtractedField, TaskStatusEnum } from "./types.js";

export async function saveExtractedField(
  extractionId: number,
  name: string,
  value: string,
  strategy: string,
  status: TaskStatusEnum
): Promise<ExtractedField> {
  const db = await getDb();

  const existingField = await getExtractedFieldByName(extractionId, name).catch(
    () => null
  );

  if (existingField) {
    const result = await db.one(
      `
        UPDATE extracted_field
        SET value = $<value>, strategy = $<strategy>, status = $<status>
        WHERE id = $<id>
        RETURNING id
      `,
      { id: existingField.id, value, strategy, status }
    );

    return getExtractedField(result.id);
  } else {
    const result = await db.one(
      `
        INSERT INTO extracted_field (extraction_id, name, value, strategy, status)
        VALUES ($<extractionId>, $<name>, $<value>, $<strategy>, $<status>)
        RETURNING id
      `,
      { extractionId, name, value, strategy, status }
    );

    return getExtractedField(result.id);
  }
}
