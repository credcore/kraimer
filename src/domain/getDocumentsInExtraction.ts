import { getDb } from "../db/index.js";
import { getDocumentProperties } from "./getDocumentProperties.js";
import { Document } from "./types.js";

export async function getDocumentsInExtraction(
  extractionId: number
): Promise<Document[]> {
  const db = getDb();
  const results = await db.manyOrNone(
    `
      SELECT d.id, d.name, d.description, d.type, d.file_content_id, d.created_at
      FROM document d
      INNER JOIN document_group_document dgd ON d.id = dgd.document_id
      INNER JOIN extraction e ON dgd.document_group_id = e.document_group_id
      WHERE e.id = $<extractionId>
    `,
    { extractionId }
  );

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
