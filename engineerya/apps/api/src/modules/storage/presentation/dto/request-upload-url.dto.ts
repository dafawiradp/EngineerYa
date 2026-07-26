import { IsIn, IsString } from "class-validator";

export class RequestUploadUrlDto {
  @IsString()
  @IsIn(["application/pdf"])
  contentType!: string;
}
