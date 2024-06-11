import { getDb } from "../db/index.js";
import { DocumentGroupProperty } from "./types.js";

export async function getDocumentGroupProperty(
  documentGroupId: number,
  name: string
): Promise<DocumentGroupProperty> {
  const db = await getDb();
  const result = await db.oneOrNone(
    `
      SELECT id, document_group_id, name, value, created_at
      FROM document_group_property
      WHERE document_group_id = $<documentGroupId> AND name = $<name>
    `,
    { documentGroupId, name }
  );

  if (!result) {
    throw new Error(
      `Cannot find DocumentGroupProperty ${name} in DocumentGroup ${documentGroupId}`
    );
  }

  return {
    id: result.id,
    documentGroupId: result.document_group_id,
    name: result.name,
    value: result.value,
    createdAt: result.created_at,
  };
}
