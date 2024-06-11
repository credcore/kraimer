// types.ts

import { TaskStatusEnum } from "./TaskStatusEnum.js";

// Document.ts
export type Document = {
  id: number;
  name: string;
  description: string;
  type: string;
  fileContentId: number;
  createdAt: Date;
  properties: DocumentProperty[];
};

// DocumentGroup.ts
export type DocumentGroup = {
  id: number;
  name: string;
  description: string;
  createdAt: Date;
  properties: DocumentGroupProperty[];
  documents: Document[];
};

// DocumentGroupProperty.ts
export type DocumentGroupProperty = {
  id: number;
  documentGroupId: number;
  name: string;
  value: string;
  createdAt: Date;
};

// DocumentProperty.ts
export type DocumentProperty = {
  id: number;
  documentId: number;
  name: string;
  value: string;
  createdAt: Date;
};

// ExtractedField.ts
export type ExtractedField = {
  id: number;
  extractionId: number;
  name: string;
  value: string;
  strategy: string;
  status: TaskStatusEnum;
  createdAt: Date;
};

// ExtractedFieldError.ts
export type ExtractedFieldError = {
  id: number;
  extractedFieldId: number;
  message: string;
  data: string;
  createdAt: Date;
};

// Extraction.ts
export type Extraction = {
  id: number;
  documentGroupId: number;
  name: string;
  status: TaskStatusEnum;
  createdAt: Date;
  properties: ExtractionProperty[];
};

// ExtractionProperty.ts
export type ExtractionProperty = {
  id: number;
  extractionId: number;
  name: string;
  value: string;
  createdAt: Date;
};

export type TaskStatusEnum = "NOT_STARTED" | "STARTED" | "FINISHED" | "ERROR";

export type OrderByEnum = "ASC" | "DESC";
