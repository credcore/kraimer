import { getDb } from "../db/index.js";
import { Document } from "./Document.js";
import { getDocumentProperties } from "./getDocumentProperties.js";
import { OrderByEnum } from "./OrderByEnum.js";

export interface DocumentFilter {
  name?: string;
}

export async function getDocuments(
  startFrom: number,
  count: number,
  filter: DocumentFilter = {},
  orderBy: OrderByEnum = OrderByEnum.ASC
): Promise<Document[]> {
  const db = getDb();
  let query = `
    SELECT id, name, description, type, file_content_id, created_at
    FROM document
  `;
  const values = [];

  if (filter.name) {
    query += ` WHERE name = $1`;
    values.push(filter.name);
  }

  query += ` ORDER BY id ${orderBy} LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
  values.push(count, startFrom);

  const results = await db.manyOrNone(query, values);

  const documents: Document[] = [];
  for (const result of results) {
    const document = new Document(
      result.id,
      result.name,
      result.description,
      result.type,
      result.file_content_id,
      result.created_at
    );

    document.properties = await getDocumentProperties(document.id);

    documents.push(document);
  }

  return documents;
}