import { getDb } from "../db/index.js";
import { getDocumentProperty } from "./getDocumentProperty.js";
import { DocumentProperty } from "./types.js";

export async function saveDocumentProperty(
  documentId: number,
  name: string,
  value: string
): Promise<DocumentProperty> {
  const db = await getDb();

  const existingProperty = await getDocumentProperty(documentId, name).catch(() => null);

  if (existingProperty) {
    await db.none(
      `
        UPDATE document_property
        SET value = $<value>
        WHERE document_id = $<documentId> AND name = $<name>
      `,
      { documentId, name, value }
    );
  } else {
    await db.none(
      `
        INSERT INTO document_property (document_id, name, value)
        VALUES ($<documentId>, $<name>, $<value>)
      `,
      { documentId, name, value }
    );
  }

  return getDocumentProperty(documentId, name);
}
