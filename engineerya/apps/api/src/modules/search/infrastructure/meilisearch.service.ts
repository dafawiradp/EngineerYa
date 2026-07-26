import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { MeiliSearch } from "meilisearch";
import { loadEnv } from "@engineerya/config";
import { BookSummaryDto } from "@engineerya/shared-types";

export const BOOKS_INDEX = "books";

export interface BookSearchDocument extends BookSummaryDto {
  // Denormalized/flattened fields that make filtering & relevance better
  // than what BookSummaryDto alone offers — search docs are allowed to
  // diverge from the API DTO shape since they're never returned directly.
  authorNames: string[];
  description: string;
}

/**
 * Thin wrapper around the Meilisearch client. Owns index configuration
 * (searchable/filterable attributes) so that's defined in exactly one
 * place instead of scattered across whoever happens to call the client.
 */
@Injectable()
export class MeilisearchService implements OnModuleInit {
  private readonly logger = new Logger(MeilisearchService.name);
  private readonly client: MeiliSearch;

  constructor() {
    const env = loadEnv();
    this.client = new MeiliSearch({
      host: env.MEILISEARCH_HOST,
      apiKey: env.MEILISEARCH_API_KEY,
    });
  }

  async onModuleInit() {
    const index = this.client.index(BOOKS_INDEX);
    await index.updateSearchableAttributes(["title", "authorNames", "description", "discipline"]);
    await index.updateFilterableAttributes(["categoryId", "discipline", "status"]);
    await index.updateSortableAttributes(["priceCents"]);
    this.logger.log("Meilisearch index configured");
  }

  async upsert(doc: BookSearchDocument): Promise<void> {
    await this.client.index(BOOKS_INDEX).addDocuments([doc], { primaryKey: "id" });
  }

  async remove(bookId: string): Promise<void> {
    await this.client.index(BOOKS_INDEX).deleteDocument(bookId);
  }

  async search(query: string, opts: { filter?: string; page: number; pageSize: number }) {
    return this.client.index(BOOKS_INDEX).search<BookSearchDocument>(query, {
      filter: opts.filter,
      offset: (opts.page - 1) * opts.pageSize,
      limit: opts.pageSize,
    });
  }
}
