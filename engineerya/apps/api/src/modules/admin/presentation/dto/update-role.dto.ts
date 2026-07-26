import { IsEnum } from "class-validator";
import { UserRole } from "@engineerya/shared-types";

export class UpdateRoleDto {
  @IsEnum(UserRole)
  role!: UserRole;
}
