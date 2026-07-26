import { ConflictException, Inject, Injectable } from "@nestjs/common";
import { UserEntity } from "../../domain/entities/user.entity";
import { IUserRepository, USER_REPOSITORY } from "../../domain/repositories/user.repository";
import { IPasswordHasher, PASSWORD_HASHER } from "../ports/password-hasher.port";
import { TokenPair } from "../ports/token.port";
import { IssueTokensService } from "../services/issue-tokens.service";

export interface RegisterUserInput {
  email: string;
  password: string;
  name: string;
}

export interface AuthResult {
  user: UserEntity;
  tokens: TokenPair;
}

@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: IUserRepository,
    @Inject(PASSWORD_HASHER) private readonly hasher: IPasswordHasher,
    private readonly issueTokens: IssueTokensService
  ) {}

  async execute(input: RegisterUserInput): Promise<AuthResult> {
    const existing = await this.users.findByEmail(input.email);
    if (existing) {
      // Deliberately generic message — do not reveal whether the account
      // exists via a different error shape than login failures.
      throw new ConflictException("Unable to register with these details.");
    }

    const passwordHash = await this.hasher.hash(input.password);

    const user = await this.users.create({
      email: input.email,
      name: input.name,
      passwordHash,
    });

    const tokens = await this.issueTokens.issueFor(user);
    return { user, tokens };
  }
}
