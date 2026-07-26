import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { BOOK_REPOSITORY, IBookRepository } from "../../../catalog/domain/repositories/book.repository";
import { ReadingProgressEntity } from "../../domain/entities/reading-progress.entity";
import {
  IReadingProgressRepository,
  READING_PROGRESS_REPOSITORY,
} from "../../domain/repositories/reading-progress.repository";

@Injectable()
export class UpdateProgressUseCase {
  constructor(
    @Inject(BOOK_REPOSITORY) private readonly books: IBookRepository,
    @Inject(READING_PROGRESS_REPOSITORY) private readonly progress: IReadingProgressRepository
  ) {}

  async execute(userId: string, bookId: string, lastPage: number): Promise<ReadingProgressEntity> {
    const book = await this.books.findById(bookId);
    if (!book) {
      throw new NotFoundException("Book not found.");
    }
    if (lastPage < 1 || lastPage > Math.max(book.pageCount, 1)) {
      throw new BadRequestException(`Page ${lastPage} is out of range (1-${book.pageCount}).`);
    }

    const percentComplete = book.pageCount > 0 ? Math.round((lastPage / book.pageCount) * 100) / 100 : 0;
    return this.progress.upsert(userId, bookId, lastPage, percentComplete);
  }
}
