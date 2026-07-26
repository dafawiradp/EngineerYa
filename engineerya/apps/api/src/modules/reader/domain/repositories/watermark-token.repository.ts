export interface IWatermarkTokenRepository {
  log(userId: string, bookId: string, page: number, sessionId: string): Promise<void>;
}

export const WATERMARK_TOKEN_REPOSITORY = Symbol("WATERMARK_TOKEN_REPOSITORY");
