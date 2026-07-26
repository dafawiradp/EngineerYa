import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserRole } from "@engineerya/shared-types";
import { ROLES_KEY } from "../decorators/roles.decorator";

/**
 * Reads roles set via @Roles(...) on the handler/class and compares
 * against req.user.role, which JwtAuthGuard populates. Must always run
 * AFTER JwtAuthGuard in the @UseGuards() list — order matters, since
 * this guard has nothing to check without req.user already set.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException("You do not have permission to perform this action.");
    }

    return true;
  }
}
