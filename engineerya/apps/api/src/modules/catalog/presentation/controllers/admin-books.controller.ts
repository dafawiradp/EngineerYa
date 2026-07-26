import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { BookDetailDto, PaginatedDto, UserRole } from "@engineerya/shared-types";
import { JwtAuthGuard } from "../../../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../../../common/guards/roles.guard";
import { Roles } from "../../../../common/decorators/roles.decorator";
import { CreateBookUseCase } from "../../application/use-cases/books/create-book.use-case";
import { UpdateBookUseCase } from "../../application/use-cases/books/update-book.use-case";
import { DeleteBookUseCase } from "../../application/use-cases/books/delete-book.use-case";
import { ListBooksUseCase } from "../../application/use-cases/books/list-books.use-case";
import { GetBookBySlugUseCase } from "../../application/use-cases/books/get-book-by-slug.use-case";
import { CreateBookDto } from "../dto/create-book.dto";
import { UpdateBookDto } from "../dto/update-book.dto";
import { BookQueryDto } from "../dto/book-query.dto";
import { BookMapper } from "../mappers/book.mapper";

// EDITOR can create/edit content; only ADMIN can delete — matches the
// "Administrators can upload/edit/delete books" requirement while still
// letting a content-editor role do day-to-day catalog work.
@Controller("admin/books")
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminBooksController {
  constructor(
    private readonly createBook: CreateBookUseCase,
    private readonly updateBook: UpdateBookUseCase,
    private readonly deleteBook: DeleteBookUseCase,
    private readonly listBooks: ListBooksUseCase,
    private readonly getBookBySlug: GetBookBySlugUseCase
  ) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async findAll(@Query() query: BookQueryDto): Promise<PaginatedDto<BookDetailDto>> {
    const result = await this.listBooks.execute({
      categoryId: query.category,
      discipline: query.discipline,
      page: query.page,
      pageSize: query.pageSize,
      includeUnpublished: true,
    });

    return {
      items: result.items.map(BookMapper.toDetail),
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 20,
      total: result.total,
    };
  }

  @Get(":slug")
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async findBySlug(@Param("slug") slug: string): Promise<BookDetailDto> {
    const book = await this.getBookBySlug.execute(slug, true);
    return BookMapper.toDetail(book);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async create(@Body() dto: CreateBookDto): Promise<BookDetailDto> {
    const book = await this.createBook.execute(dto);
    return BookMapper.toDetail(book);
  }

  @Patch(":id")
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateBookDto
  ): Promise<BookDetailDto> {
    const book = await this.updateBook.execute(id, dto);
    return BookMapper.toDetail(book);
  }

  @Delete(":id")
  @Roles(UserRole.ADMIN)
  async remove(@Param("id", ParseUUIDPipe) id: string): Promise<{ deleted: true }> {
    await this.deleteBook.execute(id);
    return { deleted: true };
  }
}
