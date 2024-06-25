import { getDb } from "../db/index.js";
import { getDocument } from "./getDocument.js";
import { DocumentGroup } from "./types.js";

export async function getDocumentGroup(id: number): Promise<DocumentGroup> {
  const db = await getDb();
  const result = await db.oneOrNone(
    `
      SELECT id, name, description, created_at
      FROM document_group
      WHERE id = $<id>
    `,
    { id }
  );

  if (!result) {
    throw new Error(`Cannot find DocumentGroup with id ${id}`);
  }

  const documentGroup: DocumentGroup = {
    id: result.id,
    name: result.name,
    description: result.description,
    createdAt: result.created_at,
    properties: [],
    documents: [],
  };

  const propertyResults = await db.manyOrNone(
    `
      SELECT id, document_group_id, name, value, created_at
      FROM document_group_property
      WHERE document_group_id = $<id>
    `,
    { id }
  );

  documentGroup.properties = propertyResults.map((prop) => ({
    id: prop.id,
    documentGroupId: prop.document_group_id,
    name: prop.name,
    value: prop.value,
    createdAt: prop.created_at,
  }));

  const documentResults = await db.manyOrNone(
    `
      SELECT document_id
      FROM document_group_document
      WHERE document_group_id = $<id>
    `,
    { id }
  );

  const documentPromises = documentResults.map((doc) =>
    getDocument(doc.document_id)
  );
  documentGroup.documents = await Promise.all(documentPromises);

  return documentGroup;
}
