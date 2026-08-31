import { Inject, Injectable } from "@nestjs/common";
import {
  CreateTransactionCommand,
  UpdateTransactionCommand,
  BulkTransactionActionCommand,
} from "@domain/ports/in/manage-transaction.port";
import type { ManageTransactionPort } from "@domain/ports/in/manage-transaction.port";
import { Transaction } from "@domain/entities/transaction.entity";
import { CREATE_TRANSACTION_USE_CASE } from "@domain/ports/in/create-transaction.port";
import type { CreateTransactionPort } from "@domain/ports/in/create-transaction.port";
import { UPDATE_TRANSACTION_USE_CASE } from "@domain/ports/in/update-transaction.port";
import type { UpdateTransactionPort } from "@domain/ports/in/update-transaction.port";
import { DELETE_TRANSACTION_USE_CASE } from "@domain/ports/in/delete-transaction.port";
import type { DeleteTransactionPort } from "@domain/ports/in/delete-transaction.port";
import { BULK_TRANSACTION_ACTION_USE_CASE } from "@domain/ports/in/bulk-transaction-action.port";
import type { BulkTransactionActionPort } from "@domain/ports/in/bulk-transaction-action.port";

@Injectable()
export class ManageTransactionUseCase implements ManageTransactionPort {
  constructor(
    @Inject(CREATE_TRANSACTION_USE_CASE)
    private readonly createUseCase: CreateTransactionPort,
    @Inject(UPDATE_TRANSACTION_USE_CASE)
    private readonly updateUseCase: UpdateTransactionPort,
    @Inject(DELETE_TRANSACTION_USE_CASE)
    private readonly deleteUseCase: DeleteTransactionPort,
    @Inject(BULK_TRANSACTION_ACTION_USE_CASE)
    private readonly bulkUseCase: BulkTransactionActionPort,
  ) {}

  async create(
    userId: string,
    cmd: CreateTransactionCommand,
  ): Promise<Transaction> {
    return this.createUseCase.execute(userId, cmd);
  }

  async update(
    userId: string,
    id: string,
    cmd: UpdateTransactionCommand,
  ): Promise<Transaction> {
    return this.updateUseCase.execute(userId, id, cmd);
  }

  async delete(userId: string, id: string): Promise<void> {
    return this.deleteUseCase.execute(userId, id);
  }

  async bulkAction(
    userId: string,
    cmd: BulkTransactionActionCommand,
  ): Promise<void> {
    return this.bulkUseCase.execute(userId, cmd);
  }
}
