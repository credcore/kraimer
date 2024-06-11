import { getDb } from "../db/index.js";
import { DocumentGroup } from "./DocumentGroup.js";
import { getDocument } from "./getDocument.js";
import { getDocumentGroupProperty } from "./getDocumentGroupProperty.js";
import { OrderByEnum } from "./OrderByEnum.js";

export interface DocumentGroupFilter {
  name?: string;
}

export async function getDocumentGroups(
  startFrom: number = 0,
  count: number = 10,
  filter: DocumentGroupFilter = {},
  orderBy: OrderByEnum = OrderByEnum.ASC
): Promise<DocumentGroup[]> {
  const db = getDb();
  let query = `
    SELECT id, name, description, created_at
    FROM document_group
  `;
  const values: any = {};

  if (filter.name) {
    query += ` WHERE name = $<name>`;
    values.name = filter.name;
  }

  query += ` ORDER BY created_at ${orderBy} LIMIT $<count> OFFSET $<startFrom>`;
  values.count = count;
  values.startFrom = startFrom;

  const results = await db.manyOrNone(query, values);

  const documentGroups: DocumentGroup[] = [];
  for (const result of results) {
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
        WHERE document_group_id = $<id>
      `,
      { id: result.id }
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
        WHERE document_group_id = $<id>
      `,
      { id: result.id }
    );

    const documentPromises = documentResults.map((doc) =>
      getDocument(doc.document_id)
    );
    documentGroup.documents = await Promise.all(documentPromises);

    documentGroups.push(documentGroup);
  }

  return documentGroups;
}
