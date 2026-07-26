import { Inject, Injectable } from "@nestjs/common";
import { CategoryEntity } from "../../../domain/entities/category.entity";
import {
  CATEGORY_REPOSITORY,
  ICategoryRepository,
} from "../../../domain/repositories/category.repository";

@Injectable()
export class ListCategoriesUseCase {
  constructor(@Inject(CATEGORY_REPOSITORY) private readonly categories: ICategoryRepository) {}

  execute(): Promise<CategoryEntity[]> {
    return this.categories.findAll();
  }
}
