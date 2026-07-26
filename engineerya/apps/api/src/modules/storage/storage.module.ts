import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { loadEnv } from "@engineerya/config";
import { CatalogModule } from "../catalog/catalog.module";
import { R2ClientService } from "./infrastructure/r2-client.service";
import { BookRenderingQueue, BOOK_RENDERING_QUEUE } from "./infrastructure/book-rendering.queue";
import { BookRenderingProcessor } from "./infrastructure/book-rendering.processor";
import { AdminStorageController } from "./presentation/admin-storage.controller";

@Module({
  imports: [
    CatalogModule,
    BullModule.forRootAsync({
      useFactory: () => {
        const env = loadEnv();
        const url = new URL(env.REDIS_URL);
        return {
          connection: {
            host: url.hostname,
            port: Number(url.port || 6379),
          },
        };
      },
    }),
    BullModule.registerQueue({ name: BOOK_RENDERING_QUEUE }),
  ],
  controllers: [AdminStorageController],
  providers: [R2ClientService, BookRenderingQueue, BookRenderingProcessor],
  exports: [R2ClientService],
})
export class StorageModule {}
