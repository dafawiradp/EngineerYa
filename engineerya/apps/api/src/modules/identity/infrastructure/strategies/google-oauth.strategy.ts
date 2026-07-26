import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback, Profile } from "passport-google-oauth20";
import { loadEnv } from "@engineerya/config";

/**
 * Only active if Google OAuth env vars are set — lets Phase 1 run and be
 * tested locally without requiring real Google credentials yet.
 */
@Injectable()
export class GoogleOAuthStrategy extends PassportStrategy(Strategy, "google") {
  constructor() {
    const env = loadEnv();
    super({
      clientID: env.GOOGLE_CLIENT_ID || "not-configured",
      clientSecret: env.GOOGLE_CLIENT_SECRET || "not-configured",
      callbackURL: env.GOOGLE_CALLBACK_URL || "http://localhost:4000/api/v1/auth/google/callback",
      scope: ["email", "profile"],
    });
  }

  validate(_accessToken: string, _refreshToken: string, profile: Profile, done: VerifyCallback) {
    const email = profile.emails?.[0]?.value;
    if (!email) {
      return done(new Error("Google account has no email."), undefined);
    }

    done(null, {
      provider: "google" as const,
      oauthId: profile.id,
      email,
      name: profile.displayName ?? email,
    });
  }
}
