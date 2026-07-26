import { UserDto, UserRole } from "@engineerya/shared-types";
import { AuthResult } from "../../application/use-cases/register-user.use-case";

export class AuthResponseDto {
  user!: UserDto;
  accessToken!: string;
  refreshToken!: string;

  static from(result: AuthResult): AuthResponseDto {
    const dto = new AuthResponseDto();
    dto.user = {
      id: result.user.id,
      email: result.user.email,
      name: result.user.name,
      role: result.user.role as UserRole,
      createdAt: result.user.createdAt.toISOString(),
    };
    dto.accessToken = result.tokens.accessToken;
    dto.refreshToken = result.tokens.refreshToken;
    return dto;
  }
}
