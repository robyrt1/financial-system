import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Req,
  UseGuards,
  Inject,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from "@nestjs/swagger";
import type { Request } from "express";
import {
  CreateGoalDto,
  UpdateGoalDto,
  DepositGoalDto,
  DeleteGoalDto,
  RedeemGoalDto,
} from "@application/dtos/goal.dtos";
import type {
  GetGoalsOverviewPort,
  CreateGoalPort,
  UpdateGoalPort,
  DepositGoalPort,
  DeleteGoalPort,
  RedeemGoalPort,
} from "@domain/ports/in/goal-in.ports";
import { GOAL_IN_PORTS } from "@infrastructure/di/tokens";
import { RoleGuard } from "@infrastructure/adapters/in/http/guards/role.guard";
import {
  GoalNotFoundException,
  InsufficientFundsException,
  GoalAlreadyCompletedException,
} from "@domain/exceptions/goal.exceptions";

@ApiTags("Goals")
@ApiBearerAuth()
@UseGuards(RoleGuard)
@Controller("v1/goals")
export class GoalController {
  constructor(
    @Inject(GOAL_IN_PORTS.GET_OVERVIEW)
    private readonly getGoalsOverviewUseCase: GetGoalsOverviewPort,
    @Inject(GOAL_IN_PORTS.CREATE)
    private readonly createGoalUseCase: CreateGoalPort,
    @Inject(GOAL_IN_PORTS.UPDATE)
    private readonly updateGoalUseCase: UpdateGoalPort,
    @Inject(GOAL_IN_PORTS.DEPOSIT)
    private readonly depositGoalUseCase: DepositGoalPort,
    @Inject(GOAL_IN_PORTS.DELETE)
    private readonly deleteGoalUseCase: DeleteGoalPort,
    @Inject(GOAL_IN_PORTS.REDEEM)
    private readonly redeemGoalUseCase: RedeemGoalPort,
  ) {}

  @Get()
  @ApiOperation({ summary: "List all goals and overview KPIs" })
  @ApiQuery({
    name: "status",
    required: false,
    enum: ["ALL", "IN_PROGRESS", "COMPLETED", "REDEEMED"],
  })
  async getOverview(
    @Req() req: Request,
    @Query("status") status?: "ALL" | "IN_PROGRESS" | "COMPLETED" | "REDEEMED",
  ) {
    const userId = req.headers["x-user-id"] as string;
    try {
      return await this.getGoalsOverviewUseCase.execute(userId, status);
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post()
  @ApiOperation({ summary: "Create a new goal" })
  async create(@Req() req: Request, @Body() data: CreateGoalDto) {
    const userId = req.headers["x-user-id"] as string;
    try {
      return await this.createGoalUseCase.execute(userId, data);
    } catch (error: any) {
      if (error instanceof InsufficientFundsException) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update an existing goal" })
  async update(
    @Req() req: Request,
    @Param("id") id: string,
    @Body() data: UpdateGoalDto,
  ) {
    const userId = req.headers["x-user-id"] as string;
    try {
      return await this.updateGoalUseCase.execute(userId, id, data);
    } catch (error: any) {
      if (error instanceof GoalNotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post(":id/deposit")
  @ApiOperation({ summary: "Make a deposit to a goal" })
  async deposit(
    @Req() req: Request,
    @Param("id") id: string,
    @Body() data: DepositGoalDto,
  ) {
    const userId = req.headers["x-user-id"] as string;
    try {
      return await this.depositGoalUseCase.execute(userId, id, data);
    } catch (error: any) {
      if (error instanceof GoalNotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      if (error instanceof InsufficientFundsException) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      if (error instanceof GoalAlreadyCompletedException) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post(":id/redeem")
  @ApiOperation({ summary: "Redeem a completed goal to an account" })
  async redeem(
    @Req() req: Request,
    @Param("id") id: string,
    @Body() data: RedeemGoalDto,
  ) {
    const userId = req.headers["x-user-id"] as string;
    try {
      return await this.redeemGoalUseCase.execute(userId, id, data);
    } catch (error: any) {
      if (error instanceof GoalNotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a goal" })
  async remove(
    @Req() req: Request,
    @Param("id") id: string,
    @Body() data: DeleteGoalDto,
  ) {
    const userId = req.headers["x-user-id"] as string;
    try {
      await this.deleteGoalUseCase.execute(userId, id, data);
      return { success: true };
    } catch (error: any) {
      if (error instanceof GoalNotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
