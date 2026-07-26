import { Inject, Injectable } from "@nestjs/common";
import { BookStatus } from "@engineerya/shared-types";
import { ListBooksResult, BOOK_REPOSITORY, IBookRepository } from "../../../domain/repositories/book.repository";

export interface ListBooksQuery {
  categoryId?: string;
  discipline?: string;
  page?: number;
  pageSize?: number;
  /** true only for admin listing — includes DRAFT/ARCHIVED books. */
  includeUnpublished?: boolean;
}

@Injectable()
export class ListBooksUseCase {
  constructor(@Inject(BOOK_REPOSITORY) private readonly books: IBookRepository) {}

  async execute(query: ListBooksQuery): Promise<ListBooksResult> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const pageSize = query.pageSize && query.pageSize > 0 ? Math.min(query.pageSize, 50) : 20;

    return this.books.list({
      categoryId: query.categoryId,
      discipline: query.discipline,
      status: query.includeUnpublished ? undefined : BookStatus.PUBLISHED,
      page,
      pageSize,
    });
  }
}
