import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { HandlePaymentWebhookUseCase } from "../../application/use-cases/handle-payment-webhook.use-case";
import { PaymentNotificationDto } from "../dto/payment-notification.dto";

/**
 * Deliberately NO JwtAuthGuard — Midtrans calls this server-to-server,
 * it can't send a user's bearer token. Trust is established entirely by
 * verifying signature_key inside HandlePaymentWebhookUseCase, not by a
 * guard here. See MidtransService.verifySignature().
 */
@Controller("payments")
export class PaymentsController {
  constructor(private readonly handleWebhook: HandlePaymentWebhookUseCase) {}

  @Post("webhook")
  @HttpCode(HttpStatus.OK)
  async webhook(@Body() dto: PaymentNotificationDto): Promise<{ received: true }> {
    await this.handleWebhook.execute(dto);
    return { received: true };
  }
}
