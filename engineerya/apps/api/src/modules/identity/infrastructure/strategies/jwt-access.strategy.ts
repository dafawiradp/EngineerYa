import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { loadEnv } from "@engineerya/config";
import { JwtPayload } from "../../application/ports/token.port";
import { IUserRepository, USER_REPOSITORY } from "../../domain/repositories/user.repository";
import { Inject } from "@nestjs/common";

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(@Inject(USER_REPOSITORY) private readonly users: IUserRepository) {
    const env = loadEnv();
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: env.JWT_ACCESS_SECRET,
    });
  }

  /**
   * Runs on every authenticated request after signature/expiry checks
   * pass. We re-fetch the user rather than trusting the payload alone,
   * so a role change or deactivation takes effect immediately instead
   * of waiting out the access token's 15-minute lifetime.
   */
  async validate(payload: JwtPayload) {
    const user = await this.users.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    return { id: user.id, email: user.email, role: user.role };
  }
}
