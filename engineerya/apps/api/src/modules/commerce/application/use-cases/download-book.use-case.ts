import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { BOOK_REPOSITORY, IBookRepository } from "../../../catalog/domain/repositories/book.repository";
import { R2ClientService } from "../../../storage/infrastructure/r2-client.service";
import { ObjectKeys } from "../../../storage/domain/object-keys";
import { PdfWatermarkService } from "../../../watermark/infrastructure/pdf-watermark.service";

export interface DownloadBookCommand {
  bookId: string;
  userEmail: string;
}

export interface DownloadedFile {
  buffer: Buffer;
  filename: string;
}

/**
 * Access control (does this user actually hold a DOWNLOAD entitlement
 * for this book?) is enforced by EntitlementGuard at the controller
 * layer, same pattern as the Reader module — this use case can assume
 * the caller is already authorized and focus purely on producing the
 * watermarked file.
 */
@Injectable()
export class DownloadBookUseCase {
  constructor(
    @Inject(BOOK_REPOSITORY) private readonly books: IBookRepository,
    private readonly r2: R2ClientService,
    private readonly pdfWatermark: PdfWatermarkService
  ) {}

  async execute(command: DownloadBookCommand): Promise<DownloadedFile> {
    const book = await this.books.findById(command.bookId);
    if (!book) {
      throw new NotFoundException("Book not found.");
    }

    const sourcePdf = await this.r2.getObjectBuffer(ObjectKeys.bookSource(command.bookId));
    const watermarked = await this.pdfWatermark.apply(sourcePdf, {
      userEmail: command.userEmail,
      bookId: command.bookId,
      timestamp: new Date(),
    });

    return { buffer: watermarked, filename: `${book.slug}.pdf` };
  }
}
