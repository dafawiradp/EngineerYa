import { IsUUID } from "class-validator";

export class CreatePurchaseDto {
  @IsUUID()
  bookId!: string;
}
