import { Document } from "./Document.js";
import { DocumentGroupProperty } from "./DocumentGroupProperty.js";

export class DocumentGroup {
  constructor(
    public id: number,
    public name: string,
    public description: string,
    public createdAt: Date,
    public properties: DocumentGroupProperty[] = [],
    public documents: Document[] = []
  ) {}

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      createdAt: this.createdAt.toISOString(),
      properties: this.properties.map((prop) => prop.toJSON()),
      documents: this.documents.map((doc) => doc.toJSON()),
    };
  }
}