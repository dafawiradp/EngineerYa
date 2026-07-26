import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { CategoryEntity } from "../../../domain/entities/category.entity";
import {
  CATEGORY_REPOSITORY,
  ICategoryRepository,
} from "../../../domain/repositories/category.repository";

export interface UpdateCategoryCommand {
  name?: string;
  parentId?: string | null;
}

@Injectable()
export class UpdateCategoryUseCase {
  constructor(@Inject(CATEGORY_REPOSITORY) private readonly categories: ICategoryRepository) {}

  async execute(id: string, command: UpdateCategoryCommand): Promise<CategoryEntity> {
    const existing = await this.categories.findById(id);
    if (!existing) {
      throw new NotFoundException("Category not found.");
    }

    if (command.parentId === id) {
      throw new BadRequestException("A category cannot be its own parent.");
    }

    if (command.parentId) {
      const parent = await this.categories.findById(command.parentId);
      if (!parent) {
        throw new BadRequestException("parentId does not reference an existing category.");
      }
    }

    return this.categories.update(id, command);
  }
}
