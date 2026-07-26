import { Controller, Get } from "@nestjs/common";
import { CategoryDto } from "@engineerya/shared-types";
import { ListCategoriesUseCase } from "../../application/use-cases/categories/list-categories.use-case";
import { CategoryMapper } from "../mappers/category.mapper";

@Controller("categories")
export class CategoriesController {
  constructor(private readonly listCategories: ListCategoriesUseCase) {}

  @Get()
  async findAll(): Promise<CategoryDto[]> {
    const categories = await this.listCategories.execute();
    return categories.map(CategoryMapper.toDto);
  }
}
