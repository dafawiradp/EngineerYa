import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { ReaderManifestDto } from "@engineerya/shared-types";
import { BOOK_REPOSITORY, IBookRepository } from "../../../catalog/domain/repositories/book.repository";

@Injectable()
export class GetManifestUseCase {
  constructor(@Inject(BOOK_REPOSITORY) private readonly books: IBookRepository) {}

  async execute(bookId: string): Promise<ReaderManifestDto> {
    const book = await this.books.findById(bookId);
    if (!book) {
      throw new NotFoundException("Book not found.");
    }

    return {
      bookId: book.id,
      pageCount: book.pageCount,
      // Structured table-of-contents extraction (from PDF bookmarks/
      // outline) is a follow-up enhancement on top of Phase 4's
      // rendering pipeline — empty for now, UI falls back to a flat
      // page list.
      tableOfContents: [],
    };
  }
}
