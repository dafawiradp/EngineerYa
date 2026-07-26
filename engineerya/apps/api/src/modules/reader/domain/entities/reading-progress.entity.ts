export class ReadingProgressEntity {
  constructor(
    public readonly userId: string,
    public readonly bookId: string,
    public readonly lastPage: number,
    public readonly percentComplete: number,
    public readonly updatedAt: Date
  ) {}
}
