import { Module } from "@nestjs/common";
import { CatalogModule } from "../catalog/catalog.module";
import { StorageModule } from "../storage/storage.module";
import { WatermarkModule } from "../watermark/watermark.module";
import { EntitlementModule } from "../entitlement/entitlement.module";

import { READING_PROGRESS_REPOSITORY } from "./domain/repositories/reading-progress.repository";
import { BOOKMARK_REPOSITORY } from "./domain/repositories/bookmark.repository";
import { WATERMARK_TOKEN_REPOSITORY } from "./domain/repositories/watermark-token.repository";

import { PrismaReadingProgressRepository } from "./infrastructure/persistence/prisma-reading-progress.repository";
import { PrismaBookmarkRepository } from "./infrastructure/persistence/prisma-bookmark.repository";
import { PrismaWatermarkTokenRepository } from "./infrastructure/persistence/prisma-watermark-token.repository";

import { GetManifestUseCase } from "./application/use-cases/get-manifest.use-case";
import { GetPageUseCase } from "./application/use-cases/get-page.use-case";
import { UpdateProgressUseCase } from "./application/use-cases/update-progress.use-case";
import { GetProgressUseCase } from "./application/use-cases/get-progress.use-case";
import { CreateBookmarkUseCase } from "./application/use-cases/create-bookmark.use-case";
import { ListBookmarksUseCase } from "./application/use-cases/list-bookmarks.use-case";

import { ReaderController } from "./presentation/controllers/reader.controller";

@Module({
  imports: [CatalogModule, StorageModule, WatermarkModule, EntitlementModule],
  controllers: [ReaderController],
  providers: [
    { provide: READING_PROGRESS_REPOSITORY, useClass: PrismaReadingProgressRepository },
    { provide: BOOKMARK_REPOSITORY, useClass: PrismaBookmarkRepository },
    { provide: WATERMARK_TOKEN_REPOSITORY, useClass: PrismaWatermarkTokenRepository },

    GetManifestUseCase,
    GetPageUseCase,
    UpdateProgressUseCase,
    GetProgressUseCase,
    CreateBookmarkUseCase,
    ListBookmarksUseCase,
  ],
})
export class ReaderModule {}
