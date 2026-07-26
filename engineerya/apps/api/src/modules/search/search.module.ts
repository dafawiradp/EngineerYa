import { Module } from "@nestjs/common";
import { CatalogModule } from "../catalog/catalog.module";
import { MeilisearchService } from "./infrastructure/meilisearch.service";
import { BookIndexListener } from "./application/book-index.listener";
import { SearchController } from "./presentation/controllers/search.controller";

@Module({
  // Imports CatalogModule (not the other way around) — Search depends on
  // Catalog's exported BOOK_REPOSITORY to build index documents; Catalog
  // has no knowledge Search exists, so this stays a one-way dependency.
  imports: [CatalogModule],
  controllers: [SearchController],
  providers: [MeilisearchService, BookIndexListener],
  exports: [MeilisearchService],
})
export class SearchModule {}
