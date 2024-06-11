export class ExtractedFieldError {
  constructor(
    public id: number,
    public extractedFieldId: number,
    public message: string,
    public data: string,
    public createdAt: Date
  ) {}

  toJSON() {
    return {
      id: this.id,
      extractedFieldId: this.extractedFieldId,
      message: this.message,
      data: this.data,
      createdAt: this.createdAt.toISOString(),
    };
  }
}