import { BookStatus } from "@engineerya/shared-types";
import { BookEntity } from "../entities/book.entity";

export interface CreateBookInput {
  title: string;
  slug: string;
  description: string;
  authorNames: string[];
  discipline: string;
  coverUrl: string;
  fileKey: string;
  pageCount?: number;
  priceCents: number;
  categoryId: string;
  status?: BookStatus;
}

export type UpdateBookInput = Partial<CreateBookInput>;

export interface ListBooksFilter {
  categoryId?: string;
  discipline?: string;
  status?: BookStatus;
  page: number;
  pageSize: number;
}

export interface ListBooksResult {
  items: BookEntity[];
  total: number;
}

/**
 * Only these methods can ever produce a BookEntity, and BookEntity has
 * no fileKey field — so leaking the private storage key through a
 * catalog response is a compile-time impossibility, not a code-review
 * discipline problem. findFileKeyById() is the one deliberate escape
 * hatch, meant to be called only by Storage/Reader infrastructure code
 * in later phases, never by a controller.
 */
export interface IBookRepository {
  findById(id: string): Promise<BookEntity | null>;
  findBySlug(slug: string): Promise<BookEntity | null>;
  list(filter: ListBooksFilter): Promise<ListBooksResult>;
  create(input: CreateBookInput): Promise<BookEntity>;
  update(id: string, input: UpdateBookInput): Promise<BookEntity>;
  delete(id: string): Promise<void>;
  findFileKeyById(id: string): Promise<string | null>;
}

export const BOOK_REPOSITORY = Symbol("BOOK_REPOSITORY");
