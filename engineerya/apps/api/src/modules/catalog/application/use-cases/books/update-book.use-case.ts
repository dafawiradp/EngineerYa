import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { BookStatus } from "@engineerya/shared-types";
import { BookEntity } from "../../../domain/entities/book.entity";
import { BOOK_REPOSITORY, IBookRepository } from "../../../domain/repositories/book.repository";
import { CATEGORY_REPOSITORY, ICategoryRepository } from "../../../domain/repositories/category.repository";
import { BOOK_UPSERTED_EVENT, BookUpsertedEvent } from "../../../domain/events/book.events";

export interface UpdateBookCommand {
  title?: string;
  description?: string;
  authorNames?: string[];
  discipline?: string;
  coverUrl?: string;
  fileKey?: string;
  priceCents?: number;
  categoryId?: string;
  status?: BookStatus;
}

@Injectable()
export class UpdateBookUseCase {
  constructor(
    @Inject(BOOK_REPOSITORY) private readonly books: IBookRepository,
    @Inject(CATEGORY_REPOSITORY) private readonly categories: ICategoryRepository,
    private readonly events: EventEmitter2
  ) {}

  async execute(id: string, command: UpdateBookCommand): Promise<BookEntity> {
    const existing = await this.books.findById(id);
    if (!existing) {
      throw new NotFoundException("Book not found.");
    }

    if (command.categoryId) {
      const category = await this.categories.findById(command.categoryId);
      if (!category) {
        throw new BadRequestException("categoryId does not reference an existing category.");
      }
    }

    // publishedAt is stamped by the repository on first transition into
    // PUBLISHED, and left untouched on subsequent edits.
    const book = await this.books.update(id, command);
    this.events.emit(BOOK_UPSERTED_EVENT, new BookUpsertedEvent(book.id));
    return book;
  }
}
