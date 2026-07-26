import { BookStatus } from "@engineerya/shared-types";
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Min,
  MinLength,
} from "class-validator";

export class CreateBookDto {
  @IsString()
  @MinLength(2)
  title!: string;

  @IsString()
  @MinLength(10)
  description!: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  authorNames!: string[];

  @IsString()
  discipline!: string;

  @IsUrl()
  coverUrl!: string;

  // Phase 4 (Storage) will replace this with a server-generated key from
  // the upload pipeline; for now admins supply the R2 object key directly.
  @IsString()
  @MinLength(3)
  fileKey!: string;

  @IsInt()
  @Min(0)
  priceCents!: number;

  @IsUUID()
  categoryId!: string;

  @IsOptional()
  @IsEnum(BookStatus)
  status?: BookStatus;
}
