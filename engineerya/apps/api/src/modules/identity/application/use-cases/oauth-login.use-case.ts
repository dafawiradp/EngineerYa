import { ConflictException, Inject, Injectable } from "@nestjs/common";
import { IUserRepository, USER_REPOSITORY } from "../../domain/repositories/user.repository";
import { IssueTokensService } from "../services/issue-tokens.service";
import { AuthResult } from "./register-user.use-case";

export interface OAuthProfileInput {
  provider: "google";
  oauthId: string;
  email: string;
  name: string;
}

@Injectable()
export class OAuthLoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: IUserRepository,
    private readonly issueTokens: IssueTokensService
  ) {}

  async execute(profile: OAuthProfileInput): Promise<AuthResult> {
    let user = await this.users.findByOAuth(profile.provider, profile.oauthId);

    if (!user) {
      // Guard against shadowing an existing password account with the
      // same email. Real account-linking (attaching oauthId to the
      // existing row) is a Phase 1 follow-up — for now we fail loudly
      // instead of silently creating a duplicate or a 500 on the unique
      // email constraint.
      const existingByEmail = await this.users.findByEmail(profile.email);
      if (existingByEmail) {
        throw new ConflictException(
          "An account with this email already exists. Please log in with your password."
        );
      }

      user = await this.users.create({
        email: profile.email,
        name: profile.name,
        passwordHash: null,
        oauthProvider: profile.provider,
        oauthId: profile.oauthId,
      });
    }

    const tokens = await this.issueTokens.issueFor(user);
    return { user, tokens };
  }
}
