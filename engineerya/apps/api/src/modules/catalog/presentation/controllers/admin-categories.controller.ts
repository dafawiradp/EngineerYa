import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { CategoryDto, UserRole } from "@engineerya/shared-types";
import { JwtAuthGuard } from "../../../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../../../common/guards/roles.guard";
import { Roles } from "../../../../common/decorators/roles.decorator";
import { CreateCategoryUseCase } from "../../application/use-cases/categories/create-category.use-case";
import { UpdateCategoryUseCase } from "../../application/use-cases/categories/update-category.use-case";
import { DeleteCategoryUseCase } from "../../application/use-cases/categories/delete-category.use-case";
import { ListCategoriesUseCase } from "../../application/use-cases/categories/list-categories.use-case";
import { CreateCategoryDto } from "../dto/create-category.dto";
import { UpdateCategoryDto } from "../dto/update-category.dto";
import { CategoryMapper } from "../mappers/category.mapper";

@Controller("admin/categories")
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminCategoriesController {
  constructor(
    private readonly createCategory: CreateCategoryUseCase,
    private readonly updateCategory: UpdateCategoryUseCase,
    private readonly deleteCategory: DeleteCategoryUseCase,
    private readonly listCategories: ListCategoriesUseCase
  ) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async findAll(): Promise<CategoryDto[]> {
    const categories = await this.listCategories.execute();
    return categories.map(CategoryMapper.toDto);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async create(@Body() dto: CreateCategoryDto): Promise<CategoryDto> {
    const category = await this.createCategory.execute(dto);
    return CategoryMapper.toDto(category);
  }

  @Patch(":id")
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryDto
  ): Promise<CategoryDto> {
    const category = await this.updateCategory.execute(id, dto);
    return CategoryMapper.toDto(category);
  }

  @Delete(":id")
  @Roles(UserRole.ADMIN)
  async remove(@Param("id", ParseUUIDPipe) id: string): Promise<{ deleted: true }> {
    await this.deleteCategory.execute(id);
    return { deleted: true };
  }
}
