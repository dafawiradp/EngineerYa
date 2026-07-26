import { Inject, Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { BookStatus } from "@engineerya/shared-types";
import { BookEntity } from "../../../domain/entities/book.entity";
import { BOOK_REPOSITORY, IBookRepository } from "../../../domain/repositories/book.repository";
import { CATEGORY_REPOSITORY, ICategoryRepository } from "../../../domain/repositories/category.repository";
import { SlugService } from "../../services/slug.service";
import { BOOK_UPSERTED_EVENT, BookUpsertedEvent } from "../../../domain/events/book.events";
import { BadRequestException } from "@nestjs/common";

export interface CreateBookCommand {
  title: string;
  description: string;
  authorNames: string[];
  discipline: string;
  coverUrl: string;
  fileKey: string;
  priceCents: number;
  categoryId: string;
  status?: BookStatus;
}

@Injectable()
export class CreateBookUseCase {
  constructor(
    @Inject(BOOK_REPOSITORY) private readonly books: IBookRepository,
    @Inject(CATEGORY_REPOSITORY) private readonly categories: ICategoryRepository,
    private readonly slugs: SlugService,
    private readonly events: EventEmitter2
  ) {}

  async execute(command: CreateBookCommand): Promise<BookEntity> {
    const category = await this.categories.findById(command.categoryId);
    if (!category) {
      throw new BadRequestException("categoryId does not reference an existing category.");
    }

    const slug = await this.slugs.unique(command.title, async (candidate) => {
      const existing = await this.books.findBySlug(candidate);
      return existing !== null;
    });

    const book = await this.books.create({
      title: command.title,
      slug,
      description: command.description,
      authorNames: command.authorNames,
      discipline: command.discipline,
      coverUrl: command.coverUrl,
      fileKey: command.fileKey,
      priceCents: command.priceCents,
      categoryId: command.categoryId,
      status: command.status ?? BookStatus.DRAFT,
    });

    this.events.emit(BOOK_UPSERTED_EVENT, new BookUpsertedEvent(book.id));
    return book;
  }
}
