import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { IUserRepository, USER_REPOSITORY } from "../../domain/repositories/user.repository";
import { IPasswordHasher, PASSWORD_HASHER } from "../ports/password-hasher.port";
import { IssueTokensService } from "../services/issue-tokens.service";
import { AuthResult } from "./register-user.use-case";

export interface LoginUserInput {
  email: string;
  password: string;
}

@Injectable()
export class LoginUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: IUserRepository,
    @Inject(PASSWORD_HASHER) private readonly hasher: IPasswordHasher,
    private readonly issueTokens: IssueTokensService
  ) {}

  async execute(input: LoginUserInput): Promise<AuthResult> {
    const user = await this.users.findByEmail(input.email);

    // Same error for "no such user" and "wrong password" — don't leak
    // account existence via response differences (timing is a separate,
    // harder problem; out of scope for Phase 1 but noted for hardening).
    if (!user || user.isOAuthOnly || !user.passwordHash) {
      throw new UnauthorizedException("Invalid email or password.");
    }

    const valid = await this.hasher.compare(input.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException("Invalid email or password.");
    }

    const tokens = await this.issueTokens.issueFor(user);
    return { user, tokens };
  }
}
