import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { IUserRepository, USER_REPOSITORY } from "../../domain/repositories/user.repository";
import {
  IRefreshTokenRepository,
  REFRESH_TOKEN_REPOSITORY,
} from "../../domain/repositories/refresh-token.repository";
import { ITokenService, TOKEN_SERVICE, TokenPair } from "../ports/token.port";
import { IssueTokensService } from "../services/issue-tokens.service";

@Injectable()
export class RefreshTokensUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: IUserRepository,
    @Inject(REFRESH_TOKEN_REPOSITORY) private readonly refreshTokens: IRefreshTokenRepository,
    @Inject(TOKEN_SERVICE) private readonly tokens: ITokenService,
    private readonly issueTokens: IssueTokensService
  ) {}

  async execute(rawRefreshToken: string): Promise<TokenPair> {
    // 1. Verify signature/expiry first — cheap and rejects garbage input
    //    before touching the database.
    let payload;
    try {
      payload = this.tokens.verifyRefreshToken(rawRefreshToken);
    } catch {
      throw new UnauthorizedException("Invalid or expired refresh token.");
    }

    // 2. Confirm the token is the one we actually issued and hasn't been
    //    revoked — this is what makes rotation + logout-everywhere possible,
    //    a signature check alone can't do that.
    const hash = this.tokens.hashToken(rawRefreshToken);
    const stored = await this.refreshTokens.findByHash(hash);
    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedException("Invalid or expired refresh token.");
    }

    const user = await this.users.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException("Invalid or expired refresh token.");
    }

    // 3. Rotate: revoke the used token, issue a brand new pair. If a
    //    revoked token is ever presented again, that's a signal of theft —
    //    a future hardening step can revoke the whole family on reuse.
    await this.refreshTokens.revoke(hash);
    return this.issueTokens.issueFor(user);
  }
}
