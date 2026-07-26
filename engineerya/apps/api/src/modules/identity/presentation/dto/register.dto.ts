import { IsEmail, IsString, MaxLength, MinLength } from "class-validator";

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8, { message: "Password must be at least 8 characters." })
  @MaxLength(72) // bcrypt silently truncates beyond this — reject instead of truncating
  password!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;
}
