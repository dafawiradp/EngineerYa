import { Injectable } from "@nestjs/common";
import { Purchase as PrismaPurchase } from "@engineerya/database";
import { PurchaseStatus } from "@engineerya/shared-types";
import { PrismaService } from "../../../../infrastructure/prisma/prisma.service";
import { PurchaseEntity } from "../../domain/entities/purchase.entity";
import { IPurchaseRepository } from "../../domain/repositories/purchase.repository";

@Injectable()
export class PrismaPurchaseRepository implements IPurchaseRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<PurchaseEntity | null> {
    const row = await this.prisma.purchase.findUnique({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async listForUser(userId: string): Promise<PurchaseEntity[]> {
    const rows = await this.prisma.purchase.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(this.toDomain);
  }

  async create(userId: string, bookId: string, priceCents: number): Promise<PurchaseEntity> {
    const row = await this.prisma.purchase.create({ data: { userId, bookId, priceCents } });
    return this.toDomain(row);
  }

  async updateStatus(id: string, status: PurchaseStatus): Promise<PurchaseEntity> {
    const row = await this.prisma.purchase.update({ where: { id }, data: { status } });
    return this.toDomain(row);
  }

  async findActivePurchase(userId: string, bookId: string): Promise<PurchaseEntity | null> {
    const row = await this.prisma.purchase.findFirst({
      where: { userId, bookId, status: PurchaseStatus.PAID },
    });
    return row ? this.toDomain(row) : null;
  }

  private toDomain(row: PrismaPurchase): PurchaseEntity {
    return new PurchaseEntity(
      row.id,
      row.userId,
      row.bookId,
      row.priceCents,
      row.status as PurchaseStatus,
      row.createdAt
    );
  }
}
