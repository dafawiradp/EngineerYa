import { IsOptional, IsString } from "class-validator";

/**
 * Mirrors Midtrans' notification payload shape (snake_case, as Midtrans
 * sends it — not remapped to camelCase, so this DTO stays a 1:1 mirror
 * of their docs and is easy to diff against future payload changes).
 * Every field needs an explicit decorator because the global
 * ValidationPipe runs with forbidNonWhitelisted: true — an undecorated
 * property would be silently stripped, dropping data the signature
 * check and status interpretation both depend on.
 */
export class PaymentNotificationDto {
  @IsString()
  order_id!: string;

  @IsString()
  status_code!: string;

  @IsString()
  gross_amount!: string;

  @IsString()
  signature_key!: string;

  @IsString()
  transaction_status!: string;

  @IsOptional()
  @IsString()
  transaction_id?: string;

  @IsOptional()
  @IsString()
  fraud_status?: string;
}
