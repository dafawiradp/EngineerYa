import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { BOOK_REPOSITORY, IBookRepository } from "../../../catalog/domain/repositories/book.repository";
import { BookmarkEntity } from "../../domain/entities/bookmark.entity";
import { BOOKMARK_REPOSITORY, IBookmarkRepository } from "../../domain/repositories/bookmark.repository";

@Injectable()
export class CreateBookmarkUseCase {
  constructor(
    @Inject(BOOK_REPOSITORY) private readonly books: IBookRepository,
    @Inject(BOOKMARK_REPOSITORY) private readonly bookmarks: IBookmarkRepository
  ) {}

  async execute(userId: string, bookId: string, page: number, note?: string): Promise<BookmarkEntity> {
    const book = await this.books.findById(bookId);
    if (!book) {
      throw new NotFoundException("Book not found.");
    }
    if (page < 1 || page > Math.max(book.pageCount, 1)) {
      throw new BadRequestException(`Page ${page} is out of range (1-${book.pageCount}).`);
    }
    return this.bookmarks.create(userId, bookId, page, note ?? null);
  }
}
