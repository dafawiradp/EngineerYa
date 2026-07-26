import { CategoryEntity } from "../entities/category.entity";

export interface CreateCategoryInput {
  name: string;
  slug: string;
  parentId?: string | null;
}

export interface UpdateCategoryInput {
  name?: string;
  slug?: string;
  parentId?: string | null;
}

export interface ICategoryRepository {
  findAll(): Promise<CategoryEntity[]>;
  findById(id: string): Promise<CategoryEntity | null>;
  findBySlug(slug: string): Promise<CategoryEntity | null>;
  create(input: CreateCategoryInput): Promise<CategoryEntity>;
  update(id: string, input: UpdateCategoryInput): Promise<CategoryEntity>;
  delete(id: string): Promise<void>;
  countBooksInCategory(id: string): Promise<number>;
}

export const CATEGORY_REPOSITORY = Symbol("CATEGORY_REPOSITORY");
