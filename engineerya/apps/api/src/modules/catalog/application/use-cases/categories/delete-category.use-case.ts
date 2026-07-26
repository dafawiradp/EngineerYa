import { ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import {
  CATEGORY_REPOSITORY,
  ICategoryRepository,
} from "../../../domain/repositories/category.repository";

@Injectable()
export class DeleteCategoryUseCase {
  constructor(@Inject(CATEGORY_REPOSITORY) private readonly categories: ICategoryRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.categories.findById(id);
    if (!existing) {
      throw new NotFoundException("Category not found.");
    }

    const bookCount = await this.categories.countBooksInCategory(id);
    if (bookCount > 0) {
      throw new ConflictException(
        `Cannot delete a category with ${bookCount} book(s) still assigned to it. Reassign or delete them first.`
      );
    }

    await this.categories.delete(id);
  }
}
