import { DocumentProperty } from "./DocumentProperty.js";

export class Document {
  constructor(
    public id: number,
    public name: string,
    public description: string,
    public type: string,
    public fileContentId: number,
    public createdAt: Date,
    public properties: DocumentProperty[] = []
  ) {}

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      type: this.type,
      fileContentId: this.fileContentId,
      createdAt: this.createdAt.toISOString(),
      properties: this.properties.map((prop) => prop.toJSON()),
    };
  }
}