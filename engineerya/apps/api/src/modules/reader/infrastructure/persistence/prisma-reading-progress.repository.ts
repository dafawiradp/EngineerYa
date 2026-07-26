import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../infrastructure/prisma/prisma.service";
import { ReadingProgressEntity } from "../../domain/entities/reading-progress.entity";
import { IReadingProgressRepository } from "../../domain/repositories/reading-progress.repository";

@Injectable()
export class PrismaReadingProgressRepository implements IReadingProgressRepository {
  constructor(private readonly prisma: PrismaService) {}

  async find(userId: string, bookId: string): Promise<ReadingProgressEntity | null> {
    const row = await this.prisma.readingProgress.findUnique({
      where: { userId_bookId: { userId, bookId } },
    });
    return row
      ? new ReadingProgressEntity(row.userId, row.bookId, row.lastPage, row.percentComplete, row.updatedAt)
      : null;
  }

  async upsert(
    userId: string,
    bookId: string,
    lastPage: number,
    percentComplete: number
  ): Promise<ReadingProgressEntity> {
    const row = await this.prisma.readingProgress.upsert({
      where: { userId_bookId: { userId, bookId } },
      create: { userId, bookId, lastPage, percentComplete },
      update: { lastPage, percentComplete },
    });
    return new ReadingProgressEntity(row.userId, row.bookId, row.lastPage, row.percentComplete, row.updatedAt);
  }
}
