import { getDb } from "../db/index.js";
import { getDocumentGroupProperty } from "./getDocumentGroupProperty.js";
import { DocumentGroupProperty } from "./types.js";

export async function saveDocumentGroupProperty(
  documentGroupId: number,
  name: string,
  value: string
): Promise<DocumentGroupProperty> {
  const db = await getDb();

  const existingProperty = await getDocumentGroupProperty(
    documentGroupId,
    name
  ).catch(() => null);

  if (existingProperty) {
    await db.none(
      `
        UPDATE document_group_property
        SET value = $<value>
        WHERE document_group_id = $<documentGroupId> AND name = $<name>
      `,
      { documentGroupId, name, value }
    );
  } else {
    await db.none(
      `
        INSERT INTO document_group_property (document_group_id, name, value)
        VALUES ($<documentGroupId>, $<name>, $<value>)
      `,
      { documentGroupId, name, value }
    );
  }

  return getDocumentGroupProperty(documentGroupId, name);
}
