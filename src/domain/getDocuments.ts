import { getDb } from "../db/index.js";
import { OrderByEnum } from "./OrderByEnum.js";
import { getDocumentProperties } from "./getDocumentProperties.js";
import { Document } from "./types.js";

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
  const values: any = {};

  if (filter.name) {
    query += ` WHERE name = $<name>`;
    values.name = filter.name;
  }

  query += ` ORDER BY id ${orderBy} LIMIT $<count> OFFSET $<startFrom>`;
  values.count = count;
  values.startFrom = startFrom;

  const results = await db.manyOrNone(query, values);

  const documents: Document[] = [];
  for (const result of results) {
    const document: Document = {
      id: result.id,
      name: result.name,
      description: result.description,
      type: result.type,
      fileContentId: result.file_content_id,
      createdAt: result.created_at,
      properties: await getDocumentProperties(result.id),
    };

    documents.push(document);
  }

  return documents;
}
