import { ConflictException, Injectable } from "@nestjs/common";
import { Prisma } from "@engineerya/database";
import { BookStatus } from "@engineerya/shared-types";
import { PrismaService } from "../../../../infrastructure/prisma/prisma.service";
import { BookEntity } from "../../domain/entities/book.entity";
import {
  CreateBookInput,
  IBookRepository,
  ListBooksFilter,
  ListBooksResult,
  UpdateBookInput,
} from "../../domain/repositories/book.repository";

// The one and only Prisma `select` in the codebase that is allowed to
// omit `fileKey` because it's the one and only place that's allowed to
// include it: this const is intentionally what everything else is NOT.
const PUBLIC_BOOK_SELECT = {
  id: true,
  title: true,
  slug: true,
  description: true,
  authorNames: true,
  discipline: true,
  coverUrl: true,
  pageCount: true,
  priceCents: true,
  status: true,
  categoryId: true,
  publishedAt: true,
  createdAt: true,
  // fileKey deliberately absent.
} satisfies Prisma.BookSelect;

type PublicBookRow = Prisma.BookGetPayload<{ select: typeof PUBLIC_BOOK_SELECT }>;

// Our shared-types BookStatus is a nominal TS enum; Prisma's generated
// BookStatus is a plain string-literal union type. Both carry the same
// runtime string values ("DRAFT" | "PUBLISHED" | "ARCHIVED"), but they
// are NOT the same TypeScript type, so passing our enum directly into a
// Prisma `where`/`data` field is rejected by the compiler. This alias
// captures Prisma's actual column type (derived, not hand-typed, so it
// can't drift from the schema) — every write boundary below casts
// through it explicitly instead of relying on structural luck.
type BookStatusColumn = PublicBookRow["status"];

@Injectable()
export class PrismaBookRepository implements IBookRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<BookEntity | null> {
    const row = await this.prisma.book.findUnique({ where: { id }, select: PUBLIC_BOOK_SELECT });
    return row ? this.toDomain(row) : null;
  }

  async findBySlug(slug: string): Promise<BookEntity | null> {
    const row = await this.prisma.book.findUnique({
      where: { slug },
      select: PUBLIC_BOOK_SELECT,
    });
    return row ? this.toDomain(row) : null;
  }

  async list(filter: ListBooksFilter): Promise<ListBooksResult> {
    const where: Prisma.BookWhereInput = {
      ...(filter.categoryId ? { categoryId: filter.categoryId } : {}),
      ...(filter.discipline ? { discipline: filter.discipline } : {}),
      ...(filter.status ? { status: filter.status as BookStatusColumn } : {}),
    };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.book.findMany({
        where,
        select: PUBLIC_BOOK_SELECT,
        orderBy: { createdAt: "desc" },
        skip: (filter.page - 1) * filter.pageSize,
        take: filter.pageSize,
      }),
      this.prisma.book.count({ where }),
    ]);

    return { items: rows.map(this.toDomain), total };
  }

  async create(input: CreateBookInput): Promise<BookEntity> {
    const row = await this.prisma.book.create({
      data: {
        title: input.title,
        slug: input.slug,
        description: input.description,
        authorNames: input.authorNames,
        discipline: input.discipline,
        coverUrl: input.coverUrl,
        fileKey: input.fileKey,
        pageCount: input.pageCount ?? 0,
        priceCents: input.priceCents,
        categoryId: input.categoryId,
        status: (input.status ?? BookStatus.DRAFT) as BookStatusColumn,
        publishedAt: input.status === BookStatus.PUBLISHED ? new Date() : null,
      },
      select: PUBLIC_BOOK_SELECT,
    });
    return this.toDomain(row);
  }

  async update(id: string, input: UpdateBookInput): Promise<BookEntity> {
    // Read current status first so we only stamp publishedAt on the
    // DRAFT/ARCHIVED → PUBLISHED transition, not on every edit.
    const current = await this.prisma.book.findUniqueOrThrow({
      where: { id },
      select: { status: true, publishedAt: true },
    });

    const isFirstPublish = input.status === BookStatus.PUBLISHED && current.status !== BookStatus.PUBLISHED;

    const row = await this.prisma.book.update({
      where: { id },
      data: {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.authorNames !== undefined ? { authorNames: input.authorNames } : {}),
        ...(input.discipline !== undefined ? { discipline: input.discipline } : {}),
        ...(input.coverUrl !== undefined ? { coverUrl: input.coverUrl } : {}),
        ...(input.fileKey !== undefined ? { fileKey: input.fileKey } : {}),
        ...(input.priceCents !== undefined ? { priceCents: input.priceCents } : {}),
        ...(input.categoryId !== undefined ? { categoryId: input.categoryId } : {}),
        ...(input.status !== undefined ? { status: input.status as BookStatusColumn } : {}),
        ...(isFirstPublish ? { publishedAt: new Date() } : {}),
      },
      select: PUBLIC_BOOK_SELECT,
    });
    return this.toDomain(row);
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.book.delete({ where: { id } });
    } catch (err) {
      // P2003 = foreign key constraint failed. Purchase.book uses
      // onDelete: Restrict deliberately (financial records must survive
      // even if the book is pulled) — this turns that DB-level rejection
      // into a clear, actionable error instead of a raw 500.
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
        throw new ConflictException(
          "This book has existing purchase records and cannot be deleted. Archive it instead."
        );
      }
      throw err;
    }
  }

  /**
   * The deliberate escape hatch — the ONLY method in this repository
   * allowed to select fileKey. Called exclusively by Storage/Reader
   * infrastructure code (Phase 4+), never by a controller.
   */
  async findFileKeyById(id: string): Promise<string | null> {
    const row = await this.prisma.book.findUnique({ where: { id }, select: { fileKey: true } });
    return row?.fileKey ?? null;
  }

  private toDomain(row: PublicBookRow): BookEntity {
    return new BookEntity(
      row.id,
      row.title,
      row.slug,
      row.description,
      row.authorNames,
      row.discipline,
      row.coverUrl,
      row.pageCount,
      row.priceCents,
      row.status as BookStatus,
      row.categoryId,
      row.publishedAt,
      row.createdAt
    );
  }
}
