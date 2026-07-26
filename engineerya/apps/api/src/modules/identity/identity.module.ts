import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";

import { USER_REPOSITORY } from "./domain/repositories/user.repository";
import { REFRESH_TOKEN_REPOSITORY } from "./domain/repositories/refresh-token.repository";
import { PASSWORD_HASHER } from "./application/ports/password-hasher.port";
import { TOKEN_SERVICE } from "./application/ports/token.port";

import { PrismaUserRepository } from "./infrastructure/persistence/prisma-user.repository";
import { PrismaRefreshTokenRepository } from "./infrastructure/persistence/prisma-refresh-token.repository";
import { BcryptPasswordHasher } from "./infrastructure/security/bcrypt-password-hasher";
import { JwtTokenService } from "./infrastructure/security/jwt-token.service";
import { JwtAccessStrategy } from "./infrastructure/strategies/jwt-access.strategy";
import { GoogleOAuthStrategy } from "./infrastructure/strategies/google-oauth.strategy";

import { IssueTokensService } from "./application/services/issue-tokens.service";
import { RegisterUserUseCase } from "./application/use-cases/register-user.use-case";
import { LoginUserUseCase } from "./application/use-cases/login-user.use-case";
import { RefreshTokensUseCase } from "./application/use-cases/refresh-tokens.use-case";
import { OAuthLoginUseCase } from "./application/use-cases/oauth-login.use-case";

import { AuthController } from "./presentation/controllers/auth.controller";

@Module({
  imports: [
    PassportModule,
    // Base JwtModule registration; JwtTokenService overrides the secret
    // per-call (access vs refresh), so no default secret is set here.
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [
    // Bind domain/application ports (interfaces) to concrete infrastructure —
    // this single block is the only place that knows Prisma/bcrypt/JWT are
    // the chosen implementations. Swapping any of them touches only here.
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
    { provide: REFRESH_TOKEN_REPOSITORY, useClass: PrismaRefreshTokenRepository },
    { provide: PASSWORD_HASHER, useClass: BcryptPasswordHasher },
    { provide: TOKEN_SERVICE, useClass: JwtTokenService },

    JwtAccessStrategy,
    GoogleOAuthStrategy,

    IssueTokensService,
    RegisterUserUseCase,
    LoginUserUseCase,
    RefreshTokensUseCase,
    OAuthLoginUseCase,
  ],
  exports: [USER_REPOSITORY],
})
export class IdentityModule {}
