import { Inject, Injectable } from "@nestjs/common";
import { BookmarkEntity } from "../../domain/entities/bookmark.entity";
import { BOOKMARK_REPOSITORY, IBookmarkRepository } from "../../domain/repositories/bookmark.repository";

@Injectable()
export class ListBookmarksUseCase {
  constructor(@Inject(BOOKMARK_REPOSITORY) private readonly bookmarks: IBookmarkRepository) {}

  execute(userId: string, bookId: string): Promise<BookmarkEntity[]> {
    return this.bookmarks.listForUser(userId, bookId);
  }
}
