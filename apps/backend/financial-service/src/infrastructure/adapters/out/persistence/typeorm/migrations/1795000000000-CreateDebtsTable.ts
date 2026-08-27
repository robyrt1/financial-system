import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateDebtsTable1795000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "debts",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            default: "uuid_generate_v4()",
          },
          {
            name: "user_id",
            type: "uuid",
          },
          {
            name: "creditor_name",
            type: "varchar",
          },
          {
            name: "type",
            type: "varchar",
          },
          {
            name: "original_amount",
            type: "decimal",
            precision: 12,
            scale: 2,
          },
          {
            name: "remaining_balance",
            type: "decimal",
            precision: 12,
            scale: 2,
          },
          {
            name: "total_installments",
            type: "int",
          },
          {
            name: "paid_installments",
            type: "int",
          },
          {
            name: "monthly_payment",
            type: "decimal",
            precision: 12,
            scale: 2,
          },
          {
            name: "monthly_interest_rate",
            type: "decimal",
            precision: 6,
            scale: 4,
          },
          {
            name: "due_day",
            type: "int",
            isNullable: true,
          },
          {
            name: "encrypted_contract_data",
            type: "text",
            isNullable: true,
          },
          {
            name: "status",
            type: "varchar",
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "now()",
          },
          {
            name: "updated_at",
            type: "timestamp",
            default: "now()",
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      "debts",
      new TableIndex({
        name: "IDX_DEBTS_USER_STATUS",
        columnNames: ["user_id", "status"],
      }),
    );

    await queryRunner.createIndex(
      "debts",
      new TableIndex({
        name: "IDX_DEBTS_USER_INTEREST",
        columnNames: ["user_id", "monthly_interest_rate"],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("debts");
  }
}
