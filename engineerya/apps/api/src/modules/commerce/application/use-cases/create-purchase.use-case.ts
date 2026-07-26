import { ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { BookStatus } from "@engineerya/shared-types";
import { BOOK_REPOSITORY, IBookRepository } from "../../../catalog/domain/repositories/book.repository";
import { PURCHASE_REPOSITORY, IPurchaseRepository } from "../../domain/repositories/purchase.repository";
import { PAYMENT_REPOSITORY, IPaymentRepository } from "../../domain/repositories/payment.repository";
import { MidtransService } from "../../../payment-gateway/infrastructure/midtrans.service";

export interface CreatePurchaseCommand {
  userId: string;
  bookId: string;
  userEmail: string;
  userName: string;
}

export interface CreatePurchaseResult {
  purchaseId: string;
  snapToken: string;
  redirectUrl: string;
}

@Injectable()
export class CreatePurchaseUseCase {
  constructor(
    @Inject(BOOK_REPOSITORY) private readonly books: IBookRepository,
    @Inject(PURCHASE_REPOSITORY) private readonly purchases: IPurchaseRepository,
    @Inject(PAYMENT_REPOSITORY) private readonly payments: IPaymentRepository,
    private readonly midtrans: MidtransService
  ) {}

  async execute(command: CreatePurchaseCommand): Promise<CreatePurchaseResult> {
    const book = await this.books.findById(command.bookId);
    if (!book || book.status !== BookStatus.PUBLISHED) {
      throw new NotFoundException("Book not found.");
    }

    const alreadyOwned = await this.purchases.findActivePurchase(command.userId, command.bookId);
    if (alreadyOwned) {
      throw new ConflictException("You already own this book.");
    }

    const purchase = await this.purchases.create(command.userId, command.bookId, book.priceCents);

    // NOTE on currency: `priceCents` is named for a cents-based currency
    // (USD-style). Midtrans/IDR is zero-decimal in practice — this passes
    // the stored integer straight through as gross_amount. If/when a
    // non-IDR payment method is added, this is the exact spot that needs
    // a currency-aware conversion; flagged rather than silently assumed.
    // Prefixed so HandlePaymentWebhookUseCase can route the notification
    // to the right domain (Purchase vs. Membership, see Phase 9) without
    // guessing from an unprefixed UUID that could theoretically collide
    // across tables.
    const snap = await this.midtrans.createSnapTransaction({
      orderId: `book-${purchase.id}`,
      grossAmount: book.priceCents,
      customerEmail: command.userEmail,
      customerName: command.userName,
      itemName: book.title,
    });

    await this.payments.create(purchase.id, null);

    return { purchaseId: purchase.id, snapToken: snap.token, redirectUrl: snap.redirectUrl };
  }
}
