import { CategoryDto } from "@engineerya/shared-types";
import { CategoryEntity } from "../../domain/entities/category.entity";

export class CategoryMapper {
  static toDto(category: CategoryEntity): CategoryDto {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      parentId: category.parentId,
    };
  }
}
