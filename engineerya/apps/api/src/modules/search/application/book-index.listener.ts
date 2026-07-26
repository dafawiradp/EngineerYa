import { Inject, Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { BOOK_REPOSITORY, IBookRepository } from "../../catalog/domain/repositories/book.repository";
import {
  BOOK_DELETED_EVENT,
  BOOK_UPSERTED_EVENT,
  BookDeletedEvent,
  BookUpsertedEvent,
} from "../../catalog/domain/events/book.events";
import { MeilisearchService } from "../infrastructure/meilisearch.service";
import { BookMapper } from "../../catalog/presentation/mappers/book.mapper";

/**
 * Keeps the Meilisearch index in sync with Postgres by reacting to
 * Catalog's domain events. Deliberately re-fetches the book by id rather
 * than trusting event payload data, so the index always reflects the
 * committed row, not a possibly-stale snapshot from the moment of the
 * write.
 */
@Injectable()
export class BookIndexListener {
  private readonly logger = new Logger(BookIndexListener.name);

  constructor(
    @Inject(BOOK_REPOSITORY) private readonly books: IBookRepository,
    private readonly search: MeilisearchService
  ) {}

  @OnEvent(BOOK_UPSERTED_EVENT)
  async handleUpserted(event: BookUpsertedEvent) {
    const book = await this.books.findById(event.bookId);
    if (!book) return; // deleted again before the handler ran — nothing to index

    // Unpublished books stay OUT of the search index entirely, not just
    // filtered at query time — so a leaked/guessed draft title can't
    // surface via search suggestions either.
    if (!book.isPublished) {
      await this.search.remove(book.id).catch(() => undefined);
      return;
    }

    await this.search.upsert({
      ...BookMapper.toSummary(book),
      authorNames: book.authorNames,
      description: book.description,
    });
    this.logger.log(`Indexed book ${book.id}`);
  }

  @OnEvent(BOOK_DELETED_EVENT)
  async handleDeleted(event: BookDeletedEvent) {
    await this.search.remove(event.bookId);
    this.logger.log(`Removed book ${event.bookId} from index`);
  }
}
