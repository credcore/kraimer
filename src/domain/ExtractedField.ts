import { TaskStatusEnum } from "./TaskStatusEnum.js";

export class ExtractedField {
  constructor(
    public id: number,
    public extractionId: number,
    public name: string,
    public value: string,
    public strategy: string,
    public status: TaskStatusEnum,
    public createdAt: Date
  ) {}

  toJSON() {
    return {
      id: this.id,
      extractionId: this.extractionId,
      name: this.name,
      value: this.value,
      strategy: this.strategy,
      status: this.status,
      createdAt: this.createdAt.toISOString(),
    };
  }
}