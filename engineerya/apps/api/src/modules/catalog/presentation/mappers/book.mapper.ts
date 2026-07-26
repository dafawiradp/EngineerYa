import { BookDetailDto, BookStatus, BookSummaryDto } from "@engineerya/shared-types";
import { BookEntity } from "../../domain/entities/book.entity";

export class BookMapper {
  static toSummary(book: BookEntity): BookSummaryDto {
    return {
      id: book.id,
      title: book.title,
      slug: book.slug,
      coverUrl: book.coverUrl,
      discipline: book.discipline,
      categoryId: book.categoryId,
      priceCents: book.priceCents,
      status: book.status as BookStatus,
    };
  }

  static toDetail(book: BookEntity): BookDetailDto {
    return {
      ...this.toSummary(book),
      description: book.description,
      authorNames: book.authorNames,
      pageCount: book.pageCount,
      publishedAt: book.publishedAt ? book.publishedAt.toISOString() : null,
    };
  }
}
