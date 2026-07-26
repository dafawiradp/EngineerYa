import { ConflictException, Injectable } from "@nestjs/common";
import { Category as PrismaCategory, Prisma } from "@engineerya/database";
import { PrismaService } from "../../../../infrastructure/prisma/prisma.service";
import { CategoryEntity } from "../../domain/entities/category.entity";
import {
  CreateCategoryInput,
  ICategoryRepository,
  UpdateCategoryInput,
} from "../../domain/repositories/category.repository";

@Injectable()
export class PrismaCategoryRepository implements ICategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<CategoryEntity[]> {
    const rows = await this.prisma.category.findMany({ orderBy: { name: "asc" } });
    return rows.map(this.toDomain);
  }

  async findById(id: string): Promise<CategoryEntity | null> {
    const row = await this.prisma.category.findUnique({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async findBySlug(slug: string): Promise<CategoryEntity | null> {
    const row = await this.prisma.category.findUnique({ where: { slug } });
    return row ? this.toDomain(row) : null;
  }

  async create(input: CreateCategoryInput): Promise<CategoryEntity> {
    const row = await this.prisma.category.create({
      data: { name: input.name, slug: input.slug, parentId: input.parentId ?? null },
    });
    return this.toDomain(row);
  }

  async update(id: string, input: UpdateCategoryInput): Promise<CategoryEntity> {
    const row = await this.prisma.category.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.slug !== undefined ? { slug: input.slug } : {}),
        ...(input.parentId !== undefined ? { parentId: input.parentId } : {}),
      },
    });
    return this.toDomain(row);
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.category.delete({ where: { id } });
    } catch (err) {
      // Safety net for a check-then-delete race: DeleteCategoryUseCase
      // already checks countBooksInCategory() first, but a book could
      // theoretically be assigned to this category between that check
      // and this delete. onDelete: Restrict on Book.category catches it
      // here either way.
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
        throw new ConflictException("This category still has books assigned to it.");
      }
      throw err;
    }
  }

  async countBooksInCategory(id: string): Promise<number> {
    return this.prisma.book.count({ where: { categoryId: id } });
  }

  private toDomain(row: PrismaCategory): CategoryEntity {
    return new CategoryEntity(row.id, row.name, row.slug, row.parentId);
  }
}
