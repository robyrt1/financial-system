import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsNumber,
  Min,
} from "class-validator";
import type { CategoryType } from "@domain/entities/category.entity";

export enum CategoryOrigin {
  ALL = "ALL",
  SYSTEM = "SYSTEM",
  CUSTOM = "CUSTOM",
}

export class ListCategoriesQueryDto {
  @ApiProperty({ required: false, enum: ["EXPENSE", "INCOME", "INVESTMENT"] })
  @IsOptional()
  @IsEnum(["EXPENSE", "INCOME", "INVESTMENT"])
  type?: CategoryType;

  @ApiProperty({
    required: false,
    enum: CategoryOrigin,
    default: CategoryOrigin.ALL,
  })
  @IsOptional()
  @IsEnum(CategoryOrigin)
  origin?: CategoryOrigin = CategoryOrigin.ALL;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  month?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year?: number;
}

export class SubcategoryResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;
}

export class CategoryResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ enum: ["EXPENSE", "INCOME", "INVESTMENT"] })
  type!: string;

  @ApiProperty()
  icon!: string;

  @ApiProperty()
  color!: string;

  @ApiProperty()
  isSystem!: boolean;

  @ApiProperty({ nullable: true })
  budgetLimit!: number | null;

  @ApiProperty()
  spentAmount!: number;

  @ApiProperty()
  percentage!: number;

  @ApiProperty({ enum: ["SAFE", "WARNING", "DANGER"] })
  status!: "SAFE" | "WARNING" | "DANGER";

  @ApiProperty({ type: [SubcategoryResponseDto] })
  subcategories!: SubcategoryResponseDto[];
}

export class CreateCategoryDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty({ enum: ["EXPENSE", "INCOME", "INVESTMENT"] })
  @IsEnum(["EXPENSE", "INCOME", "INVESTMENT"])
  type!: CategoryType;

  @ApiProperty()
  @IsString()
  icon!: string;

  @ApiProperty()
  @IsString()
  color!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  budgetLimit?: number;
}

export class UpdateCategoryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  color?: string;
}

export class UpdateCategoryBudgetDto {
  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  budgetLimit!: number | null;
}

export class CreateSubcategoryDto {
  @ApiProperty()
  @IsString()
  name!: string;
}
