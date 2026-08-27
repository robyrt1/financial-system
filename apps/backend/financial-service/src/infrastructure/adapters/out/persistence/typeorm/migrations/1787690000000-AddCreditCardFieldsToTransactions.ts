import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCreditCardFieldsToTransactions1787690000000 implements MigrationInterface {
  name = "AddCreditCardFieldsToTransactions1787690000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD "paymentMethod" character varying NOT NULL DEFAULT 'ACCOUNT'`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD "creditCardId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD "installments" integer NOT NULL DEFAULT 1`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP COLUMN "installments"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP COLUMN "creditCardId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP COLUMN "paymentMethod"`,
    );
  }
}
