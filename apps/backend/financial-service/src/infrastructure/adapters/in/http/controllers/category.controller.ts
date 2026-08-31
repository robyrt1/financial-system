import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Inject,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { CurrentUser } from "../decorators/current-user.decorator";
import type { InternalUserContext } from "../decorators/current-user.decorator";
import {
  ListCategoriesQueryDto,
  CategoryResponseDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  UpdateCategoryBudgetDto,
  CreateSubcategoryDto,
} from "@application/dtos/category.dtos";
import {
  LIST_CATEGORIES_USE_CASE,
  CREATE_CATEGORY_USE_CASE,
  UPDATE_CATEGORY_USE_CASE,
  UPDATE_CATEGORY_BUDGET_USE_CASE,
  DELETE_CATEGORY_USE_CASE,
  CREATE_SUBCATEGORY_USE_CASE,
  DELETE_SUBCATEGORY_USE_CASE,
} from "@domain/ports/in/category-in.ports";
import type {
  ListCategoriesWithBudgetPort,
  CreateCategoryPort,
  UpdateCategoryPort,
  UpdateCategoryBudgetPort,
  DeleteCategoryPort,
  CreateSubcategoryPort,
  DeleteSubcategoryPort,
} from "@domain/ports/in/category-in.ports";

@ApiTags("Categories")
@ApiBearerAuth()
@Controller("v1/categories")
export class CategoryController {
  constructor(
    @Inject(LIST_CATEGORIES_USE_CASE)
    private readonly listCategoriesUseCase: ListCategoriesWithBudgetPort,
    @Inject(CREATE_CATEGORY_USE_CASE)
    private readonly createCategoryUseCase: CreateCategoryPort,
    @Inject(UPDATE_CATEGORY_USE_CASE)
    private readonly updateCategoryUseCase: UpdateCategoryPort,
    @Inject(UPDATE_CATEGORY_BUDGET_USE_CASE)
    private readonly updateCategoryBudgetUseCase: UpdateCategoryBudgetPort,
    @Inject(DELETE_CATEGORY_USE_CASE)
    private readonly deleteCategoryUseCase: DeleteCategoryPort,
    @Inject(CREATE_SUBCATEGORY_USE_CASE)
    private readonly createSubcategoryUseCase: CreateSubcategoryPort,
    @Inject(DELETE_SUBCATEGORY_USE_CASE)
    private readonly deleteSubcategoryUseCase: DeleteSubcategoryPort,
  ) {}

  @Get()
  @ApiOperation({
    summary: "List categories with budget and consumption details",
  })
  @ApiResponse({ status: 200, type: [CategoryResponseDto] })
  async listCategories(
    @CurrentUser() user: InternalUserContext,
    @Query() query: ListCategoriesQueryDto,
  ) {
    const userId = user.userId;
    return this.listCategoriesUseCase.execute(userId, query);
  }

  @Post()
  @ApiOperation({ summary: "Create a custom category" })
  @ApiResponse({ status: 201 })
  async createCategory(
    @CurrentUser() user: InternalUserContext,
    @Body() dto: CreateCategoryDto,
  ) {
    const userId = user.userId;
    const category = await this.createCategoryUseCase.execute({
      userId,
      name: dto.name,
      type: dto.type,
      icon: dto.icon,
      color: dto.color,
      budgetLimit: dto.budgetLimit,
    });
    return { id: category.id };
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a custom category" })
  @ApiResponse({ status: 200 })
  async updateCategory(
    @CurrentUser() user: InternalUserContext,
    @Param("id") id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    const userId = user.userId;
    await this.updateCategoryUseCase.execute({
      categoryId: id,
      userId,
      name: dto.name || "",
      icon: dto.icon || "",
      color: dto.color || "",
    });
    return { success: true };
  }

  @Patch(":id/budget")
  @ApiOperation({ summary: "Update category budget limit" })
  @ApiResponse({ status: 200 })
  async updateCategoryBudget(
    @CurrentUser() user: InternalUserContext,
    @Param("id") id: string,
    @Body() dto: UpdateCategoryBudgetDto,
  ) {
    const userId = user.userId;
    await this.updateCategoryBudgetUseCase.execute(id, userId, dto.budgetLimit);
    return { success: true };
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a custom category" })
  @ApiResponse({ status: 204 })
  async deleteCategory(
    @CurrentUser() user: InternalUserContext,
    @Param("id") id: string,
  ) {
    const userId = user.userId;
    await this.deleteCategoryUseCase.execute(id, userId);
  }

  @Post(":id/subcategories")
  @ApiOperation({ summary: "Create a subcategory" })
  @ApiResponse({ status: 201 })
  async createSubcategory(
    @CurrentUser() user: InternalUserContext,
    @Param("id") id: string,
    @Body() dto: CreateSubcategoryDto,
  ) {
    const userId = user.userId;
    const subcategory = await this.createSubcategoryUseCase.execute({
      categoryId: id,
      userId,
      name: dto.name,
    });
    return { id: subcategory.id };
  }

  @Delete("/v1/subcategories/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a subcategory" })
  @ApiResponse({ status: 204 })
  async deleteSubcategory(
    @CurrentUser() user: InternalUserContext,
    @Param("id") id: string,
  ) {
    const userId = user.userId;
    await this.deleteSubcategoryUseCase.execute(id, userId);
  }
}
