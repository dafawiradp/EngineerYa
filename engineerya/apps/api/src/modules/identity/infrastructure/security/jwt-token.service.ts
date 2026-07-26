import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { createHash } from "crypto";
import { loadEnv } from "@engineerya/config";
import { ITokenService, JwtPayload } from "../../application/ports/token.port";

/**
 * Access and refresh tokens use DIFFERENT secrets. This means a leaked
 * access token (short-lived, sent on every request, higher exposure)
 * can never be replayed as a refresh token (long-lived, higher value).
 */
@Injectable()
export class JwtTokenService implements ITokenService {
  private readonly env = loadEnv();

  constructor(private readonly jwt: JwtService) {}

  signAccessToken(payload: JwtPayload): string {
    return this.jwt.sign(payload, {
      secret: this.env.JWT_ACCESS_SECRET,
      expiresIn: this.env.JWT_ACCESS_EXPIRES_IN,
    });
  }

  signRefreshToken(payload: JwtPayload): { token: string; expiresAt: Date } {
    const token = this.jwt.sign(payload, {
      secret: this.env.JWT_REFRESH_SECRET,
      expiresIn: this.env.JWT_REFRESH_EXPIRES_IN,
    });

    const decoded = this.jwt.decode(token) as { exp: number };
    const expiresAt = new Date(decoded.exp * 1000);

    return { token, expiresAt };
  }

  verifyRefreshToken(token: string): JwtPayload {
    return this.jwt.verify<JwtPayload>(token, { secret: this.env.JWT_REFRESH_SECRET });
  }

  hashToken(token: string): string {
    // We never store raw refresh tokens (see RefreshToken model comment).
    // SHA-256 is sufficient here — this is a lookup key over an
    // already-high-entropy, signed JWT, not a password.
    return createHash("sha256").update(token).digest("hex");
  }
}
