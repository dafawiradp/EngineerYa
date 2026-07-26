import { IsInt, IsOptional, IsString, Min } from "class-validator";

export class CreateBookmarkDto {
  @IsInt()
  @Min(1)
  page!: number;

  @IsOptional()
  @IsString()
  note?: string;
}
