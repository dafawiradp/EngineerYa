import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { BOOK_REPOSITORY, IBookRepository } from "../../../catalog/domain/repositories/book.repository";
import { R2ClientService } from "../../../storage/infrastructure/r2-client.service";
import { ObjectKeys } from "../../../storage/domain/object-keys";
import { WatermarkService } from "../../../watermark/infrastructure/watermark.service";
import {
  IWatermarkTokenRepository,
  WATERMARK_TOKEN_REPOSITORY,
} from "../../domain/repositories/watermark-token.repository";

export interface GetPageCommand {
  bookId: string;
  page: number;
  userId: string;
  userEmail: string;
  userName: string;
  sessionId: string;
}

export interface RenderedPage {
  buffer: Buffer;
  contentType: string;
}

@Injectable()
export class GetPageUseCase {
  constructor(
    @Inject(BOOK_REPOSITORY) private readonly books: IBookRepository,
    private readonly r2: R2ClientService,
    private readonly watermark: WatermarkService,
    @Inject(WATERMARK_TOKEN_REPOSITORY) private readonly watermarkTokens: IWatermarkTokenRepository
  ) {}

  async execute(command: GetPageCommand): Promise<RenderedPage> {
    const book = await this.books.findById(command.bookId);
    if (!book) {
      throw new NotFoundException("Book not found.");
    }

    // NOTE: this only checks the book exists. Real entitlement
    // (did this user pay / does their membership cover this book) is
    // added in Phase 8 as an additional guard here — tracked explicitly
    // so this isn't mistaken for a finished access-control story.
    if (command.page < 1 || command.page > book.pageCount) {
      throw new BadRequestException(`Page ${command.page} is out of range (1-${book.pageCount}).`);
    }

    const baseImage = await this.r2.getObjectBuffer(ObjectKeys.bookPage(command.bookId, command.page));

    const watermarked = await this.watermark.apply(baseImage, {
      userEmail: command.userEmail,
      userName: command.userName,
      bookId: command.bookId,
      page: command.page,
      sessionId: command.sessionId,
      timestamp: new Date(),
    });

    await this.watermarkTokens.log(command.userId, command.bookId, command.page, command.sessionId);

    return { buffer: watermarked, contentType: "image/jpeg" };
  }
}
