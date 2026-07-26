import { Controller, Get, Header, Param, ParseUUIDPipe, StreamableFile, UseGuards } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { EntitlementType } from "@engineerya/shared-types";
import { JwtAuthGuard } from "../../../../common/guards/jwt-auth.guard";
import { CurrentUser, RequestUser } from "../../../../common/decorators/current-user.decorator";
import { EntitlementGuard } from "../../../entitlement/presentation/guards/entitlement.guard";
import { RequireEntitlement } from "../../../entitlement/presentation/decorators/require-entitlement.decorator";
import { DownloadBookUseCase } from "../../application/use-cases/download-book.use-case";

@Controller("downloads")
@UseGuards(JwtAuthGuard, EntitlementGuard)
export class DownloadsController {
  constructor(private readonly downloadBook: DownloadBookUseCase) {}

  @Get(":bookId")
  @RequireEntitlement(EntitlementType.DOWNLOAD)
  // Downloads are large and infrequent by nature; this just guards
  // against a script hammering the endpoint to re-download repeatedly.
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Header("Cache-Control", "no-store")
  async download(
    @Param("bookId", ParseUUIDPipe) bookId: string,
    @CurrentUser() user: RequestUser
  ): Promise<StreamableFile> {
    const result = await this.downloadBook.execute({ bookId, userEmail: user.email });

    return new StreamableFile(result.buffer, {
      type: "application/pdf",
      disposition: `attachment; filename="${result.filename}"`,
    });
  }
}
