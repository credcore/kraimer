import { getDb } from "../db/index.js";
import { DocumentGroup } from "./DocumentGroup.js";
import { getDocument } from "./getDocument.js";
import { getDocumentGroupProperty } from "./getDocumentGroupProperty.js";

export async function getDocumentGroup(id: number): Promise<DocumentGroup | null> {
  const db = getDb();
  const result = await db.oneOrNone(
    `
      SELECT id, name, description, created_at
      FROM document_group
      WHERE id = $1
    `,
    [id]
  );

  if (!result) {
    return null;
  }

  const documentGroup = new DocumentGroup(
    result.id,
    result.name,
    result.description,
    result.created_at
  );

  const propertyResults = await db.manyOrNone(
    `
      SELECT id, document_group_id, name, value, created_at
      FROM document_group_property
      WHERE document_group_id = $1
    `,
    [id]
  );

  documentGroup.properties = propertyResults.map(
    (prop) =>
      new DocumentGroupProperty(
        prop.id,
        prop.document_group_id,
        prop.name,
        prop.value,
        prop.created_at
      )
  );

  const documentResults = await db.manyOrNone(
    `
      SELECT document_id
      FROM document_group_document
      WHERE document_group_id = $1
    `,
    [id]
  );

  const documentPromises = documentResults.map((doc) => getDocument(doc.document_id));
  documentGroup.documents = await Promise.all(documentPromises);

  return documentGroup;
}