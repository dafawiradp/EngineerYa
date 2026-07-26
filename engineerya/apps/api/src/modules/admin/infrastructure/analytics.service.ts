import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../infrastructure/prisma/prisma.service";

export interface AnalyticsOverview {
  totalUsers: number;
  totalPublishedBooks: number;
  totalPurchases: number;
  totalRevenueCents: number;
  activeMemberships: number;
}

/**
 * Deliberate, documented exception to "only repositories touch Prisma":
 * analytics is a read-only reporting concern that aggregates across
 * multiple domains (Identity, Catalog, Commerce, Membership) at once.
 * Forcing this through each domain's repository interface would mean
 * adding report-shaped methods (e.g. IBookRepository.countPublished())
 * that have nothing to do with that domain's actual business rules —
 * a worse violation of separation of concerns than this service reading
 * straight from Prisma for aggregate counts.
 */
@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async overview(): Promise<AnalyticsOverview> {
    const [totalUsers, totalPublishedBooks, totalPurchases, revenue, activeMemberships] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.book.count({ where: { status: "PUBLISHED" } }),
      this.prisma.purchase.count({ where: { status: "PAID" } }),
      this.prisma.purchase.aggregate({ where: { status: "PAID" }, _sum: { priceCents: true } }),
      this.prisma.membership.count({ where: { status: "ACTIVE", expiresAt: { gt: new Date() } } }),
    ]);

    return {
      totalUsers,
      totalPublishedBooks,
      totalPurchases,
      totalRevenueCents: revenue._sum.priceCents ?? 0,
      activeMemberships,
    };
  }
}
