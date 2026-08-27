import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateFinancialTables1787630534673 implements MigrationInterface {
  name = "CreateFinancialTables1787630534673";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "credit_cards" ("id" uuid NOT NULL, "userId" uuid NOT NULL, "accountId" uuid NOT NULL, "cardName" character varying NOT NULL, "maskedDigits" character varying NOT NULL, "creditLimit" numeric(15,2) NOT NULL, "availableLimit" numeric(15,2) NOT NULL, "closingDay" integer NOT NULL, "dueDay" integer NOT NULL, "encryptedPayload" jsonb NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7749b596e358703bb3dd8b45b7c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "invoices" ("id" uuid NOT NULL, "creditCardId" uuid NOT NULL, "month" integer NOT NULL, "year" integer NOT NULL, "totalAmount" numeric(15,2) NOT NULL DEFAULT '0', "status" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_668cef7c22a427fd822cc1be3ce" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "accounts" ("id" uuid NOT NULL, "userId" uuid NOT NULL, "name" character varying NOT NULL, "type" character varying NOT NULL, "balance" numeric(15,2) NOT NULL DEFAULT '0', "currency" character varying NOT NULL DEFAULT 'BRL', "syncStatus" character varying NOT NULL, "encryptedDetails" jsonb NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_5a7a02c20412299d198e097a8fe" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "accounts"`);
    await queryRunner.query(`DROP TABLE "invoices"`);
    await queryRunner.query(`DROP TABLE "credit_cards"`);
  }
}
