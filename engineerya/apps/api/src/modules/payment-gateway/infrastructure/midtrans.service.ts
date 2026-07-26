import { Injectable, Logger } from "@nestjs/common";
import { createHash } from "crypto";
import { loadEnv } from "@engineerya/config";

export interface CreateSnapTransactionInput {
  orderId: string;
  grossAmount: number;
  customerEmail: string;
  customerName: string;
  itemName: string;
}

export interface SnapTransaction {
  token: string;
  redirectUrl: string;
}

export interface MidtransNotification {
  order_id: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
  transaction_status: string;
  transaction_id?: string;
  fraud_status?: string;
}

/**
 * Thin wrapper around Midtrans' Snap API. Uses the global `fetch` (Node
 * 20+) rather than adding a dedicated SDK dependency — Midtrans' REST
 * surface used here is small enough that a hand-rolled client is easier
 * to audit than importing a third-party wrapper around it.
 */
@Injectable()
export class MidtransService {
  private readonly logger = new Logger(MidtransService.name);

  private get baseUrl(): string {
    const env = loadEnv();
    return env.MIDTRANS_IS_PRODUCTION ? "https://app.midtrans.com" : "https://app.sandbox.midtrans.com";
  }

  private get authHeader(): string {
    const env = loadEnv();
    const encoded = Buffer.from(`${env.MIDTRANS_SERVER_KEY ?? "not-configured"}:`).toString("base64");
    return `Basic ${encoded}`;
  }

  async createSnapTransaction(input: CreateSnapTransactionInput): Promise<SnapTransaction> {
    const response = await fetch(`${this.baseUrl}/snap/v1/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: this.authHeader,
      },
      body: JSON.stringify({
        transaction_details: {
          order_id: input.orderId,
          gross_amount: input.grossAmount,
        },
        customer_details: {
          email: input.customerEmail,
          first_name: input.customerName,
        },
        item_details: [
          {
            id: input.orderId,
            price: input.grossAmount,
            quantity: 1,
            name: input.itemName.slice(0, 50), // Midtrans caps item name length
          },
        ],
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      this.logger.error(`Midtrans transaction creation failed: ${response.status} ${body}`);
      throw new Error("Failed to create payment transaction.");
    }

    const data = (await response.json()) as { token: string; redirect_url: string };
    return { token: data.token, redirectUrl: data.redirect_url };
  }

  /**
   * Per Midtrans docs: signature_key = SHA512(order_id + status_code +
   * gross_amount + ServerKey). This is what makes the webhook trustworthy
   * — anyone can POST to a public webhook URL, but only Midtrans (who
   * knows the server key) can produce a matching signature.
   */
  verifySignature(notification: MidtransNotification): boolean {
    const env = loadEnv();
    const expected = createHash("sha512")
      .update(
        `${notification.order_id}${notification.status_code}${notification.gross_amount}${env.MIDTRANS_SERVER_KEY ?? ""}`
      )
      .digest("hex");
    return expected === notification.signature_key;
  }

  /**
   * Maps Midtrans' transaction_status vocabulary down to the three
   * outcomes our domain actually cares about.
   */
  interpretStatus(notification: MidtransNotification): "SUCCESS" | "FAILED" | "PENDING" {
    const status = notification.transaction_status;
    if (status === "capture" || status === "settlement") {
      if (notification.fraud_status && notification.fraud_status !== "accept") {
        return "FAILED";
      }
      return "SUCCESS";
    }
    if (status === "deny" || status === "cancel" || status === "expire") {
      return "FAILED";
    }
    return "PENDING";
  }
}
