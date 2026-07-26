import { UserRole } from "@engineerya/shared-types";

export interface JwtPayload {
  sub: string; // user id
  email: string;
  role: UserRole;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
}

export interface ITokenService {
  signAccessToken(payload: JwtPayload): string;
  signRefreshToken(payload: JwtPayload): { token: string; expiresAt: Date };
  verifyRefreshToken(token: string): JwtPayload;
  hashToken(token: string): string;
}

export const TOKEN_SERVICE = Symbol("TOKEN_SERVICE");
