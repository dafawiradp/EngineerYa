import { Controller, Get, Param, Query } from "@nestjs/common";
import { BookDetailDto, PaginatedDto, BookSummaryDto } from "@engineerya/shared-types";
import { ListBooksUseCase } from "../../application/use-cases/books/list-books.use-case";
import { GetBookBySlugUseCase } from "../../application/use-cases/books/get-book-by-slug.use-case";
import { BookQueryDto } from "../dto/book-query.dto";
import { BookMapper } from "../mappers/book.mapper";

@Controller("books")
export class BooksController {
  constructor(
    private readonly listBooks: ListBooksUseCase,
    private readonly getBookBySlug: GetBookBySlugUseCase
  ) {}

  @Get()
  async findAll(@Query() query: BookQueryDto): Promise<PaginatedDto<BookSummaryDto>> {
    const result = await this.listBooks.execute({
      categoryId: query.category,
      discipline: query.discipline,
      page: query.page,
      pageSize: query.pageSize,
    });

    return {
      items: result.items.map(BookMapper.toSummary),
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 20,
      total: result.total,
    };
  }

  @Get(":slug")
  async findBySlug(@Param("slug") slug: string): Promise<BookDetailDto> {
    const book = await this.getBookBySlug.execute(slug, false);
    return BookMapper.toDetail(book);
  }
}
