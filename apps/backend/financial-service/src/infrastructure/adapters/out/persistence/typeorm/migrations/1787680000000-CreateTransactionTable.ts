import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTransactionTable1787680000000 implements MigrationInterface {
  name = "CreateTransactionTable1787680000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "transactions" (
                "id" uuid NOT NULL, 
                "userId" uuid NOT NULL, 
                "accountId" uuid NOT NULL, 
                "categoryId" uuid, 
                "destinationAccountId" uuid, 
                "description" character varying NOT NULL, 
                "amount" numeric(15,2) NOT NULL, 
                "type" character varying NOT NULL, 
                "status" character varying NOT NULL, 
                "date" character varying NOT NULL, 
                "tags" jsonb NOT NULL DEFAULT '[]', 
                "encryptedDetails" jsonb, 
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(), 
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), 
                CONSTRAINT "PK_transactions" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(
      `CREATE INDEX "IDX_transactions_user_date" ON "transactions" ("userId", "date")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_transactions_user_account" ON "transactions" ("userId", "accountId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_transactions_user_account"`);
    await queryRunner.query(`DROP INDEX "IDX_transactions_user_date"`);
    await queryRunner.query(`DROP TABLE "transactions"`);
  }
}
