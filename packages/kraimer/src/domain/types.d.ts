export type Document = {
    id: number;
    name: string;
    description: string;
    type: string;
    fileContentId: number;
    createdAt: Date;
    properties: DocumentProperty[];
};
export type FileContent = {
    id: number;
    filePath: string;
};
export type DocumentGroup = {
    id: number;
    name: string;
    description: string;
    createdAt: Date;
    properties: DocumentGroupProperty[];
    documents: Document[];
};
export type DocumentGroupProperty = {
    id: number;
    documentGroupId: number;
    name: string;
    value: string;
    createdAt: Date;
};
export type DocumentProperty = {
    id: number;
    documentId: number;
    name: string;
    value: string;
    createdAt: Date;
};
export type ExtractedField = {
    id: number;
    extractionId: number;
    name: string;
    value: string;
    strategy: string;
    status: TaskStatusEnum;
    createdAt: Date;
};
export type ExtractedFieldError = {
    id: number;
    extractedFieldId: number;
    message: string;
    data: string;
    createdAt: Date;
};
export type Extraction = {
    id: number;
    documentGroupId: number;
    name: string;
    status: TaskStatusEnum;
    createdAt: Date;
    properties: ExtractionProperty[];
};
export type ExtractionProperty = {
    id: number;
    extractionId: number;
    name: string;
    value: string;
    createdAt: Date;
};
export type TaskStatusEnum = "NOT_STARTED" | "STARTED" | "FINISHED" | "ERROR";
export type OrderByEnum = "ASC" | "DESC";
