export class DocumentProperty {
  constructor(
    public id: number,
    public documentId: number,
    public name: string,
    public value: string,
    public createdAt: Date
  ) {}

  toJSON() {
    return {
      id: this.id,
      documentId: this.documentId,
      name: this.name,
      value: this.value,
      createdAt: this.createdAt.toISOString(),
    };
  }
}