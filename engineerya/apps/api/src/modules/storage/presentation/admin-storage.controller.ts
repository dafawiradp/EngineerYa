import { Body, Controller, Inject, NotFoundException, Param, ParseUUIDPipe, Post, UseGuards } from "@nestjs/common";
import { UserRole } from "@engineerya/shared-types";
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { Roles } from "../../../common/decorators/roles.decorator";
import { R2ClientService } from "../infrastructure/r2-client.service";
import { BookRenderingQueue } from "../infrastructure/book-rendering.queue";
import { ObjectKeys } from "../domain/object-keys";
import { RequestUploadUrlDto } from "./dto/request-upload-url.dto";
import { BOOK_REPOSITORY, IBookRepository } from "../../catalog/domain/repositories/book.repository";

@Controller("admin/storage/books")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.EDITOR)
export class AdminStorageController {
  constructor(
    private readonly r2: R2ClientService,
    private readonly renderingQueue: BookRenderingQueue,
    @Inject(BOOK_REPOSITORY) private readonly books: IBookRepository
  ) {}

  /**
   * Step 1 of the upload flow: the admin UI calls this to get a
   * short-lived signed PUT URL, then uploads the PDF directly to R2
   * from the browser — the raw file never passes through our API.
   */
  @Post(":id/upload-url")
  async requestUploadUrl(@Param("id", ParseUUIDPipe) id: string, @Body() dto: RequestUploadUrlDto) {
    const book = await this.books.findById(id);
    if (!book) {
      throw new NotFoundException("Book not found.");
    }

    const url = await this.r2.createUploadUrl(ObjectKeys.bookSource(id), dto.contentType);
    return { uploadUrl: url, expiresInSeconds: 120 };
  }

  /**
   * Step 2: once the browser confirms the PUT succeeded, the admin UI
   * calls this to enqueue background rendering (Phase 4 processor).
   */
  @Post(":id/render")
  async triggerRender(@Param("id", ParseUUIDPipe) id: string) {
    const book = await this.books.findById(id);
    if (!book) {
      throw new NotFoundException("Book not found.");
    }

    await this.renderingQueue.enqueue(id);
    return { queued: true };
  }
}
