import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  NotFoundException,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { Request } from "express";
import { UserRole } from "@engineerya/shared-types";
import { JwtAuthGuard } from "../../../../common/guards/jwt-auth.guard";
import { GoogleAuthGuard } from "../../../../common/guards/google-auth.guard";
import { CurrentUser, RequestUser } from "../../../../common/decorators/current-user.decorator";
import { RegisterUserUseCase } from "../../application/use-cases/register-user.use-case";
import { LoginUserUseCase } from "../../application/use-cases/login-user.use-case";
import { RefreshTokensUseCase } from "../../application/use-cases/refresh-tokens.use-case";
import { OAuthLoginUseCase } from "../../application/use-cases/oauth-login.use-case";
import { IUserRepository, USER_REPOSITORY } from "../../domain/repositories/user.repository";
import { RegisterDto } from "../dto/register.dto";
import { LoginDto } from "../dto/login.dto";
import { RefreshTokenDto } from "../dto/refresh-token.dto";
import { AuthResponseDto } from "../dto/auth-response.dto";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly registerUser: RegisterUserUseCase,
    private readonly loginUser: LoginUserUseCase,
    private readonly refreshTokens: RefreshTokensUseCase,
    private readonly oauthLogin: OAuthLoginUseCase,
    @Inject(USER_REPOSITORY) private readonly users: IUserRepository
  ) {}

  @Post("register")
  async register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    const result = await this.registerUser.execute(dto);
    return AuthResponseDto.from(result);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    const result = await this.loginUser.execute(dto);
    return AuthResponseDto.from(result);
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.refreshTokens.execute(dto.refreshToken);
  }

  @Get("google")
  @UseGuards(GoogleAuthGuard)
  googleLogin() {
    // Guard redirects to Google; handler body never runs.
  }

  @Get("google/callback")
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req: Request) {
    const profile = req.user as {
      provider: "google";
      oauthId: string;
      email: string;
      name: string;
    };
    const result = await this.oauthLogin.execute(profile);
    return AuthResponseDto.from(result);
    // Production note: redirect to WEB_URL with tokens handed off via a
    // short-lived one-time code or httpOnly cookie, rather than returning
    // tokens as JSON straight from a browser-redirected GET — tracked as
    // a Phase 1 hardening follow-up.
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() currentUser: RequestUser) {
    const user = await this.users.findById(currentUser.id);
    if (!user) {
      throw new NotFoundException("User not found.");
    }
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
