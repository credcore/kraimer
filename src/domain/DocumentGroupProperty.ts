export class DocumentGroupProperty {
  constructor(
    public id: number,
    public documentGroupId: number,
    public name: string,
    public value: string,
    public createdAt: Date
  ) {}

  toJSON() {
    return {
      id: this.id,
      documentGroupId: this.documentGroupId,
      name: this.name,
      value: this.value,
      createdAt: this.createdAt.toISOString(),
    };
  }
}