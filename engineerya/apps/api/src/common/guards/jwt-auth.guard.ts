import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

/**
 * Applies the "jwt" (access token) Passport strategy. Use on every route
 * that requires a logged-in user, e.g. @UseGuards(JwtAuthGuard, RolesGuard).
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {}
