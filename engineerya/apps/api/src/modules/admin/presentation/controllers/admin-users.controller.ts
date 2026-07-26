import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Query, UseGuards } from "@nestjs/common";
import { PaginatedDto, UserDto, UserRole } from "@engineerya/shared-types";
import { JwtAuthGuard } from "../../../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../../../common/guards/roles.guard";
import { Roles } from "../../../../common/decorators/roles.decorator";
import { IUserRepository, USER_REPOSITORY } from "../../../identity/domain/repositories/user.repository";
import { UpdateRoleDto } from "../dto/update-role.dto";
import { PaginationQueryDto } from "../dto/pagination-query.dto";
import { Inject } from "@nestjs/common";

@Controller("admin/users")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminUsersController {
  constructor(@Inject(USER_REPOSITORY) private readonly users: IUserRepository) {}

  @Get()
  async list(@Query() query: PaginationQueryDto): Promise<PaginatedDto<UserDto>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const { items, total } = await this.users.listPaginated(page, pageSize);

    return {
      items: items.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        createdAt: u.createdAt.toISOString(),
      })),
      page,
      pageSize,
      total,
    };
  }

  @Patch(":id/role")
  async updateRole(@Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdateRoleDto): Promise<UserDto> {
    const user = await this.users.updateRole(id, dto.role);
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
