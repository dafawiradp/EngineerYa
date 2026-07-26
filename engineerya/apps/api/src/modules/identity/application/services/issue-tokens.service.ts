import { Inject, Injectable } from "@nestjs/common";
import { UserEntity } from "../../domain/entities/user.entity";
import {
  IRefreshTokenRepository,
  REFRESH_TOKEN_REPOSITORY,
} from "../../domain/repositories/refresh-token.repository";
import { ITokenService, TOKEN_SERVICE, TokenPair } from "../ports/token.port";

/**
 * Shared by register/login/oauth-login/refresh — the single place that
 * mints an access+refresh pair and persists the refresh token hash.
 * Centralizing this means every login path gets rotation and revocation
 * for free, instead of each use case re-implementing it slightly differently.
 */
@Injectable()
export class IssueTokensService {
  constructor(
    @Inject(TOKEN_SERVICE) private readonly tokens: ITokenService,
    @Inject(REFRESH_TOKEN_REPOSITORY) private readonly refreshTokens: IRefreshTokenRepository
  ) {}

  async issueFor(user: UserEntity): Promise<TokenPair> {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = this.tokens.signAccessToken(payload);
    const { token: refreshToken, expiresAt } = this.tokens.signRefreshToken(payload);

    await this.refreshTokens.save(user.id, this.tokens.hashToken(refreshToken), expiresAt);

    return { accessToken, refreshToken, refreshTokenExpiresAt: expiresAt };
  }
}
