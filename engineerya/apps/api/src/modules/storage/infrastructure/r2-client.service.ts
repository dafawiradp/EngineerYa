import { Injectable, Logger } from "@nestjs/common";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { loadEnv } from "@engineerya/config";

/**
 * Cloudflare R2 is S3-compatible, so the standard AWS SDK v3 S3 client
 * works unmodified against R2's endpoint — no R2-specific SDK needed.
 *
 * This is the ONLY place in the codebase that talks to object storage.
 * Every other module (Catalog, Reader, Watermark) goes through the
 * narrow methods below, never touches the S3 client directly.
 */
@Injectable()
export class R2ClientService {
  private readonly logger = new Logger(R2ClientService.name);
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly signedUrlTtl: number;

  constructor() {
    const env = loadEnv();
    this.bucket = env.R2_BUCKET_NAME;
    this.signedUrlTtl = env.R2_SIGNED_URL_TTL_SECONDS;

    this.client = new S3Client({
      region: "auto",
      endpoint: env.R2_ACCOUNT_ID ? `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : undefined,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID ?? "not-configured",
        secretAccessKey: env.R2_SECRET_ACCESS_KEY ?? "not-configured",
      },
    });
  }

  async uploadBuffer(key: string, body: Buffer, contentType: string): Promise<void> {
    await this.client.send(
      new PutObjectCommand({ Bucket: this.bucket, Key: key, Body: body, ContentType: contentType })
    );
  }

  async getObjectBuffer(key: string): Promise<Buffer> {
    const result = await this.client.send(new GetObjectCommand({ Bucket: this.bucket, Key: key }));
    const bytes = await result.Body?.transformToByteArray();
    if (!bytes) {
      throw new Error(`Object ${key} has no body`);
    }
    return Buffer.from(bytes);
  }

  async deleteObject(key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }

  /**
   * Short-lived signed PUT URL — used ONLY by the admin upload flow so
   * the raw source PDF goes browser→R2 directly, never through our API
   * process. The book file itself is large; proxying it would waste
   * API memory/bandwidth for no security benefit (this is an authenticated
   * admin-only operation either way).
   */
  async createUploadUrl(key: string, contentType: string): Promise<string> {
    const command = new PutObjectCommand({ Bucket: this.bucket, Key: key, ContentType: contentType });
    return getSignedUrl(this.client, command, { expiresIn: this.signedUrlTtl });
  }
}
