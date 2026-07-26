import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { SubscribeMembershipResponseDto, MembershipDto } from "@engineerya/shared-types";
import { JwtAuthGuard } from "../../../../common/guards/jwt-auth.guard";
import { CurrentUser, RequestUser } from "../../../../common/decorators/current-user.decorator";
import { SubscribeMembershipUseCase } from "../../application/use-cases/subscribe-membership.use-case";
import { GetMyMembershipUseCase } from "../../application/use-cases/get-my-membership.use-case";
import { SubscribeMembershipDto } from "../dto/subscribe-membership.dto";

@Controller("memberships")
@UseGuards(JwtAuthGuard)
export class MembershipsController {
  constructor(
    private readonly subscribeMembership: SubscribeMembershipUseCase,
    private readonly getMyMembership: GetMyMembershipUseCase
  ) {}

  @Post("subscribe")
  async subscribe(
    @Body() dto: SubscribeMembershipDto,
    @CurrentUser() user: RequestUser
  ): Promise<SubscribeMembershipResponseDto> {
    const result = await this.subscribeMembership.execute({
      userId: user.id,
      planId: dto.planId,
      userEmail: user.email,
      userName: user.email,
    });
    return { membershipId: result.membershipId, snapToken: result.snapToken, redirectUrl: result.redirectUrl };
  }

  @Get("me")
  async mine(@CurrentUser() user: RequestUser): Promise<MembershipDto | null> {
    const membership = await this.getMyMembership.execute(user.id);
    if (!membership) return null;
    return {
      id: membership.id,
      plan: membership.plan,
      status: membership.status,
      startsAt: membership.startsAt.toISOString(),
      expiresAt: membership.expiresAt.toISOString(),
    };
  }
}
