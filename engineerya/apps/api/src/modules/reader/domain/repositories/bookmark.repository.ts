import { BookmarkEntity } from "../entities/bookmark.entity";

export interface IBookmarkRepository {
  listForUser(userId: string, bookId: string): Promise<BookmarkEntity[]>;
  create(userId: string, bookId: string, page: number, note: string | null): Promise<BookmarkEntity>;
}

export const BOOKMARK_REPOSITORY = Symbol("BOOKMARK_REPOSITORY");
