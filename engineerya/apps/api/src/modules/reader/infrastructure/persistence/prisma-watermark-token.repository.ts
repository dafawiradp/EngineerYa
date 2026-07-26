import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../infrastructure/prisma/prisma.service";
import { IWatermarkTokenRepository } from "../../domain/repositories/watermark-token.repository";

@Injectable()
export class PrismaWatermarkTokenRepository implements IWatermarkTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async log(userId: string, bookId: string, page: number, sessionId: string): Promise<void> {
    await this.prisma.watermarkToken.create({ data: { userId, bookId, page, sessionId } });
  }
}
