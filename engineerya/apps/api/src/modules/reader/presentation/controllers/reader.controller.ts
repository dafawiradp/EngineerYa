import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  StreamableFile,
  UseGuards,
} from "@nestjs/common";
import { randomUUID } from "crypto";
import { Throttle } from "@nestjs/throttler";
import { EntitlementType, ReaderManifestDto } from "@engineerya/shared-types";
import { JwtAuthGuard } from "../../../../common/guards/jwt-auth.guard";
import { CurrentUser, RequestUser } from "../../../../common/decorators/current-user.decorator";
import { EntitlementGuard } from "../../../entitlement/presentation/guards/entitlement.guard";
import { RequireEntitlement } from "../../../entitlement/presentation/decorators/require-entitlement.decorator";
import { GetManifestUseCase } from "../../application/use-cases/get-manifest.use-case";
import { GetPageUseCase } from "../../application/use-cases/get-page.use-case";
import { UpdateProgressUseCase } from "../../application/use-cases/update-progress.use-case";
import { GetProgressUseCase } from "../../application/use-cases/get-progress.use-case";
import { CreateBookmarkUseCase } from "../../application/use-cases/create-bookmark.use-case";
import { ListBookmarksUseCase } from "../../application/use-cases/list-bookmarks.use-case";
import { UpdateProgressDto } from "../dto/update-progress.dto";
import { CreateBookmarkDto } from "../dto/create-bookmark.dto";

/**
 * Every route requires a logged-in user AND a READ entitlement on the
 * :bookId in the route (free preview books would get a PROMO-sourced
 * entitlement granted at publish time — not built yet, tracked as a
 * follow-up). This is the guard that was a documented TODO through
 * Phases 5-7; it's live now, not a rewrite of those routes.
 */
@Controller("reader")
@UseGuards(JwtAuthGuard, EntitlementGuard)
@RequireEntitlement(EntitlementType.READ)
export class ReaderController {
  constructor(
    private readonly getManifest: GetManifestUseCase,
    private readonly getPage: GetPageUseCase,
    private readonly updateProgress: UpdateProgressUseCase,
    private readonly getProgress: GetProgressUseCase,
    private readonly createBookmark: CreateBookmarkUseCase,
    private readonly listBookmarks: ListBookmarksUseCase
  ) {}

  @Get(":bookId/manifest")
  manifest(@Param("bookId", ParseUUIDPipe) bookId: string): Promise<ReaderManifestDto> {
    return this.getManifest.execute(bookId);
  }

  @Get(":bookId/pages/:page")
  // Tighter than the global default (120/min): a human reading turns
  // pages far slower than this; a scraper trying to pull an entire book
  // page-by-page hits this ceiling fast.
  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  async page(
    @Param("bookId", ParseUUIDPipe) bookId: string,
    @Param("page", ParseIntPipe) page: number,
    @CurrentUser() user: RequestUser,
    @Headers("x-reader-session") sessionHeader?: string
  ): Promise<StreamableFile> {
    // The reader UI is expected to generate one session id per tab/open
    // and send it consistently — falling back to a fresh one keeps this
    // endpoint working even if the client omits it, at the cost of
    // weaker session-level traceability for that request.
    const sessionId = sessionHeader ?? randomUUID();

    const result = await this.getPage.execute({
      bookId,
      page,
      userId: user.id,
      userEmail: user.email,
      userName: user.email,
      sessionId,
    });

    return new StreamableFile(result.buffer, {
      type: result.contentType,
      disposition: "inline",
    });
  }

  @Patch(":bookId/progress")
  saveProgress(
    @Param("bookId", ParseUUIDPipe) bookId: string,
    @Body() dto: UpdateProgressDto,
    @CurrentUser() user: RequestUser
  ) {
    return this.updateProgress.execute(user.id, bookId, dto.lastPage);
  }

  @Get(":bookId/progress")
  progress(@Param("bookId", ParseUUIDPipe) bookId: string, @CurrentUser() user: RequestUser) {
    return this.getProgress.execute(user.id, bookId);
  }

  @Get(":bookId/bookmarks")
  bookmarks(@Param("bookId", ParseUUIDPipe) bookId: string, @CurrentUser() user: RequestUser) {
    return this.listBookmarks.execute(user.id, bookId);
  }

  @Post(":bookId/bookmarks")
  addBookmark(
    @Param("bookId", ParseUUIDPipe) bookId: string,
    @Body() dto: CreateBookmarkDto,
    @CurrentUser() user: RequestUser
  ) {
    return this.createBookmark.execute(user.id, bookId, dto.page, dto.note);
  }
}
