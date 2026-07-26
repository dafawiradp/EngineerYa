import { Injectable } from "@nestjs/common";
import { Bookmark as PrismaBookmark } from "@engineerya/database";
import { PrismaService } from "../../../../infrastructure/prisma/prisma.service";
import { BookmarkEntity } from "../../domain/entities/bookmark.entity";
import { IBookmarkRepository } from "../../domain/repositories/bookmark.repository";

@Injectable()
export class PrismaBookmarkRepository implements IBookmarkRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listForUser(userId: string, bookId: string): Promise<BookmarkEntity[]> {
    const rows = await this.prisma.bookmark.findMany({
      where: { userId, bookId },
      orderBy: { page: "asc" },
    });
    return rows.map(
      (r: PrismaBookmark) => new BookmarkEntity(r.id, r.userId, r.bookId, r.page, r.note, r.createdAt)
    );
  }

  async create(userId: string, bookId: string, page: number, note: string | null): Promise<BookmarkEntity> {
    const row = await this.prisma.bookmark.create({ data: { userId, bookId, page, note } });
    return new BookmarkEntity(row.id, row.userId, row.bookId, row.page, row.note, row.createdAt);
  }
}
