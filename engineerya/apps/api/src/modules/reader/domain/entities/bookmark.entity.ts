export class BookmarkEntity {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly bookId: string,
    public readonly page: number,
    public readonly note: string | null,
    public readonly createdAt: Date
  ) {}
}
