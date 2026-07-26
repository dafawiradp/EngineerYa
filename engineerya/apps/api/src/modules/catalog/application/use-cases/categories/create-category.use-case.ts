import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { CategoryEntity } from "../../../domain/entities/category.entity";
import {
  CATEGORY_REPOSITORY,
  ICategoryRepository,
} from "../../../domain/repositories/category.repository";
import { SlugService } from "../../services/slug.service";

export interface CreateCategoryCommand {
  name: string;
  parentId?: string | null;
}

@Injectable()
export class CreateCategoryUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY) private readonly categories: ICategoryRepository,
    private readonly slugs: SlugService
  ) {}

  async execute(command: CreateCategoryCommand): Promise<CategoryEntity> {
    if (command.parentId) {
      const parent = await this.categories.findById(command.parentId);
      if (!parent) {
        throw new BadRequestException("parentId does not reference an existing category.");
      }
    }

    const slug = await this.slugs.unique(command.name, async (candidate) => {
      const existing = await this.categories.findBySlug(candidate);
      return existing !== null;
    });

    return this.categories.create({ name: command.name, slug, parentId: command.parentId });
  }
}
