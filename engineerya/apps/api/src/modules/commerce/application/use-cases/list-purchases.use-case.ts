import { Inject, Injectable } from "@nestjs/common";
import { PurchaseEntity } from "../../domain/entities/purchase.entity";
import { PURCHASE_REPOSITORY, IPurchaseRepository } from "../../domain/repositories/purchase.repository";

@Injectable()
export class ListPurchasesUseCase {
  constructor(@Inject(PURCHASE_REPOSITORY) private readonly purchases: IPurchaseRepository) {}

  execute(userId: string): Promise<PurchaseEntity[]> {
    return this.purchases.listForUser(userId);
  }
}
