import { PurchaseDto } from "@engineerya/shared-types";
import { PurchaseEntity } from "../../domain/entities/purchase.entity";

export class PurchaseMapper {
  static toDto(purchase: PurchaseEntity): PurchaseDto {
    return {
      id: purchase.id,
      bookId: purchase.bookId,
      priceCents: purchase.priceCents,
      status: purchase.status,
      createdAt: purchase.createdAt.toISOString(),
    };
  }
}
