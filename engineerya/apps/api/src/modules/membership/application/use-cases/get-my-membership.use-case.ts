import { Inject, Injectable } from "@nestjs/common";
import { MembershipEntity } from "../../domain/entities/membership.entity";
import { MEMBERSHIP_REPOSITORY, IMembershipRepository } from "../../domain/repositories/membership.repository";

@Injectable()
export class GetMyMembershipUseCase {
  constructor(@Inject(MEMBERSHIP_REPOSITORY) private readonly memberships: IMembershipRepository) {}

  execute(userId: string): Promise<MembershipEntity | null> {
    return this.memberships.findActiveForUser(userId);
  }
}
