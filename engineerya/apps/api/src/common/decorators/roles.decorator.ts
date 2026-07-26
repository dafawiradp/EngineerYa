import { SetMetadata } from "@nestjs/common";
import { UserRole } from "@engineerya/shared-types";

export const ROLES_KEY = "roles";

/**
 * @Roles(UserRole.ADMIN) on a controller or handler. Combine with
 * @UseGuards(JwtAuthGuard, RolesGuard) — the guard reads this metadata.
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
