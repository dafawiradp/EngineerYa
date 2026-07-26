import { PurchaseStatus } from "@engineerya/shared-types";

export class PurchaseEntity {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly bookId: string,
    public readonly priceCents: number,
    public readonly status: PurchaseStatus,
    public readonly createdAt: Date
  ) {}
}
