import { getDb } from "../db/index.js";
import { Document } from "./Document.js";
import { getDocumentProperties } from "./getDocumentProperties.js";

export async function getDocumentsInExtraction(extractionId: number): Promise<Document[]> {
  const db = getDb();
  const results = await db.manyOrNone(
    `
      SELECT d.id, d.name, d.description, d.type, d.file_content_id, d.created_at
      FROM document d
      INNER JOIN document_group_document dgd ON d.id = dgd.document_id
      INNER JOIN extraction e ON dgd.document_group_id = e.document_group_id
      WHERE e.id = $1
    `,
    [extractionId]
  );

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