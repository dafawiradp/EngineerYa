import { Module } from "@nestjs/common";

import { BOOK_REPOSITORY } from "./domain/repositories/book.repository";
import { CATEGORY_REPOSITORY } from "./domain/repositories/category.repository";

import { PrismaBookRepository } from "./infrastructure/persistence/prisma-book.repository";
import { PrismaCategoryRepository } from "./infrastructure/persistence/prisma-category.repository";

import { SlugService } from "./application/services/slug.service";
import { CreateBookUseCase } from "./application/use-cases/books/create-book.use-case";
import { UpdateBookUseCase } from "./application/use-cases/books/update-book.use-case";
import { DeleteBookUseCase } from "./application/use-cases/books/delete-book.use-case";
import { ListBooksUseCase } from "./application/use-cases/books/list-books.use-case";
import { GetBookBySlugUseCase } from "./application/use-cases/books/get-book-by-slug.use-case";
import { CreateCategoryUseCase } from "./application/use-cases/categories/create-category.use-case";
import { UpdateCategoryUseCase } from "./application/use-cases/categories/update-category.use-case";
import { DeleteCategoryUseCase } from "./application/use-cases/categories/delete-category.use-case";
import { ListCategoriesUseCase } from "./application/use-cases/categories/list-categories.use-case";

import { BooksController } from "./presentation/controllers/books.controller";
import { CategoriesController } from "./presentation/controllers/categories.controller";
import { AdminBooksController } from "./presentation/controllers/admin-books.controller";
import { AdminCategoriesController } from "./presentation/controllers/admin-categories.controller";

@Module({
  controllers: [BooksController, CategoriesController, AdminBooksController, AdminCategoriesController],
  providers: [
    { provide: BOOK_REPOSITORY, useClass: PrismaBookRepository },
    { provide: CATEGORY_REPOSITORY, useClass: PrismaCategoryRepository },

    SlugService,
    CreateBookUseCase,
    UpdateBookUseCase,
    DeleteBookUseCase,
    ListBooksUseCase,
    GetBookBySlugUseCase,
    CreateCategoryUseCase,
    UpdateCategoryUseCase,
    DeleteCategoryUseCase,
    ListCategoriesUseCase,
  ],
  // BOOK_REPOSITORY is exported because Search (Phase 3) needs to read
  // books to build its index, and Storage/Reader (Phase 4+) need
  // findFileKeyById() — both without re-implementing Prisma access.
  exports: [BOOK_REPOSITORY, CATEGORY_REPOSITORY],
})
export class CatalogModule {}
