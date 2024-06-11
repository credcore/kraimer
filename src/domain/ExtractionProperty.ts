export class ExtractionProperty {
  constructor(
    public id: number,
    public extractionId: number,
    public name: string,
    public value: string,
    public createdAt: Date
  ) {}

  toJSON() {
    return {
      id: this.id,
      extractionId: this.extractionId,
      name: this.name,
      value: this.value,
      createdAt: this.createdAt.toISOString(),
    };
  }
}