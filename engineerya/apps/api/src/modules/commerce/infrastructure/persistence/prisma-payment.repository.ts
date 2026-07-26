import { Injectable } from "@nestjs/common";
import { Prisma } from "@engineerya/database";
import { PaymentStatus } from "@engineerya/shared-types";
import { PrismaService } from "../../../../infrastructure/prisma/prisma.service";
import { IPaymentRepository } from "../../domain/repositories/payment.repository";

@Injectable()
export class PrismaPaymentRepository implements IPaymentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(purchaseId: string, providerRef: string | null): Promise<void> {
    await this.prisma.payment.create({ data: { purchaseId, providerRef } });
  }

  async updateByPurchaseId(
    purchaseId: string,
    status: PaymentStatus,
    providerRef: string,
    rawPayload: unknown
  ): Promise<void> {
    await this.prisma.payment.update({
      where: { purchaseId },
      data: { status, providerRef, rawPayload: rawPayload as Prisma.InputJsonValue },
    });
  }
}
