import { Module } from "@nestjs/common";
import { MidtransService } from "./infrastructure/midtrans.service";

// Standalone module (no dependency on Commerce or Membership) so both
// can import it without creating a circular dependency between them —
// Commerce needs to check Membership orders in its webhook, Membership
// needs Midtrans to create its own subscription transactions; neither
// needs to depend on the other for the payment gateway client itself.
@Module({
  providers: [MidtransService],
  exports: [MidtransService],
})
export class PaymentGatewayModule {}
