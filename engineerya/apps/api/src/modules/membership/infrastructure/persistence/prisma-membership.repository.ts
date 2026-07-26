import { Injectable } from "@nestjs/common";
import { Membership as PrismaMembership } from "@engineerya/database";
import { PrismaService } from "../../../../infrastructure/prisma/prisma.service";
import { MembershipEntity, MembershipStatus } from "../../domain/entities/membership.entity";
import { IMembershipRepository } from "../../domain/repositories/membership.repository";

@Injectable()
export class PrismaMembershipRepository implements IMembershipRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<MembershipEntity | null> {
    const row = await this.prisma.membership.findUnique({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async findActiveForUser(userId: string): Promise<MembershipEntity | null> {
    const row = await this.prisma.membership.findFirst({
      where: { userId, status: "ACTIVE", expiresAt: { gt: new Date() } },
      orderBy: { expiresAt: "desc" },
    });
    return row ? this.toDomain(row) : null;
  }

  async create(userId: string, plan: string, expiresAt: Date): Promise<MembershipEntity> {
    const row = await this.prisma.membership.create({
      data: { userId, plan, status: "PENDING", expiresAt },
    });
    return this.toDomain(row);
  }

  async updateStatus(id: string, status: MembershipStatus): Promise<MembershipEntity> {
    const row = await this.prisma.membership.update({ where: { id }, data: { status } });
    return this.toDomain(row);
  }

  async activate(id: string, expiresAt: Date): Promise<MembershipEntity> {
    const row = await this.prisma.membership.update({
      where: { id },
      data: { status: "ACTIVE", startsAt: new Date(), expiresAt },
    });
    return this.toDomain(row);
  }

  private toDomain(row: PrismaMembership): MembershipEntity {
    return new MembershipEntity(
      row.id,
      row.userId,
      row.plan,
      row.status as MembershipStatus,
      row.startsAt,
      row.expiresAt
    );
  }
}
