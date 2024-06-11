import { ExtractionProperty } from "./ExtractionProperty.js";
import { TaskStatusEnum } from "./TaskStatusEnum.js";

export class Extraction {
  constructor(
    public id: number,
    public documentGroupId: number,
    public name: string,
    public status: TaskStatusEnum,
    public createdAt: Date,
    public properties: ExtractionProperty[] = []
  ) {}

  toJSON() {
    return {
      id: this.id,
      documentGroupId: this.documentGroupId,
      name: this.name,
      status: this.status,
      createdAt: this.createdAt.toISOString(),
      properties: this.properties.map((prop) => prop.toJSON()),
    };
  }
}