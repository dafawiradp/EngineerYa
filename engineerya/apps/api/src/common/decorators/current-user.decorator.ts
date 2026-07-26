import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export interface RequestUser {
  id: string;
  email: string;
  role: string;
}

/**
 * @CurrentUser() in a controller method to grab the authenticated user
 * that JwtAuthGuard attached to the request — avoids reaching into
 * `@Req() req` and re-typing `req.user` in every handler.
 */
export const CurrentUser = createParamDecorator((_: unknown, ctx: ExecutionContext): RequestUser => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});
