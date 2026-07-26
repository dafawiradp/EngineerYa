import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { BookStatus } from "@engineerya/shared-types";
import { BookEntity } from "../../../domain/entities/book.entity";
import { BOOK_REPOSITORY, IBookRepository } from "../../../domain/repositories/book.repository";

@Injectable()
export class GetBookBySlugUseCase {
  constructor(@Inject(BOOK_REPOSITORY) private readonly books: IBookRepository) {}

  /**
   * @param includeUnpublished — true only for admin/editor callers; the
   * public controller must never pass true, so an unpublished book
   * can't be reached by guessing its slug.
   */
  async execute(slug: string, includeUnpublished = false): Promise<BookEntity> {
    const book = await this.books.findBySlug(slug);
    if (!book || (!includeUnpublished && book.status !== BookStatus.PUBLISHED)) {
      throw new NotFoundException("Book not found.");
    }
    return book;
  }
}
