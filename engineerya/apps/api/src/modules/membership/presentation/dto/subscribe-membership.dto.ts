import { IsIn } from "class-validator";

export class SubscribeMembershipDto {
  @IsIn(["MONTHLY", "YEARLY"])
  planId!: string;
}
