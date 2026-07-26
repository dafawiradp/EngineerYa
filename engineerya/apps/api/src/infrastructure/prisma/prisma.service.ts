import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@engineerya/database";

/**
 * Thin lifecycle wrapper around PrismaClient so it's a proper Nest provider
 * (connects on boot, disconnects cleanly on shutdown) instead of a bare
 * singleton import scattered across repositories.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    await this.$connect();
    this.logger.log("Prisma connected");
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
