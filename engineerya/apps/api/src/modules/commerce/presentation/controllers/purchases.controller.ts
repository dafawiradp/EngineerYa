import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { CreatePurchaseResponseDto, PurchaseDto } from "@engineerya/shared-types";
import { JwtAuthGuard } from "../../../../common/guards/jwt-auth.guard";
import { CurrentUser, RequestUser } from "../../../../common/decorators/current-user.decorator";
import { CreatePurchaseUseCase } from "../../application/use-cases/create-purchase.use-case";
import { ListPurchasesUseCase } from "../../application/use-cases/list-purchases.use-case";
import { CreatePurchaseDto } from "../dto/create-purchase.dto";
import { PurchaseMapper } from "../mappers/purchase.mapper";

@Controller("purchases")
@UseGuards(JwtAuthGuard)
export class PurchasesController {
  constructor(
    private readonly createPurchase: CreatePurchaseUseCase,
    private readonly listPurchases: ListPurchasesUseCase
  ) {}

  @Post()
  async create(
    @Body() dto: CreatePurchaseDto,
    @CurrentUser() user: RequestUser
  ): Promise<CreatePurchaseResponseDto> {
    const result = await this.createPurchase.execute({
      userId: user.id,
      bookId: dto.bookId,
      userEmail: user.email,
      userName: user.email,
    });
    return { purchaseId: result.purchaseId, snapToken: result.snapToken, redirectUrl: result.redirectUrl };
  }

  @Get("me")
  async mine(@CurrentUser() user: RequestUser): Promise<PurchaseDto[]> {
    const purchases = await this.listPurchases.execute(user.id);
    return purchases.map(PurchaseMapper.toDto);
  }
}
