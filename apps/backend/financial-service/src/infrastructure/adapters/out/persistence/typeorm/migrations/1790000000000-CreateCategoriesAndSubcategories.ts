import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from "typeorm";

export class CreateCategoriesAndSubcategories1790000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "categories",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
          },
          {
            name: "userId",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "name",
            type: "varchar",
          },
          {
            name: "type",
            type: "varchar",
          },
          {
            name: "icon",
            type: "varchar",
          },
          {
            name: "color",
            type: "varchar",
          },
          {
            name: "isSystem",
            type: "boolean",
            default: false,
          },
          {
            name: "budgetLimit",
            type: "decimal",
            precision: 15,
            scale: 2,
            isNullable: true,
          },
          {
            name: "createdAt",
            type: "timestamp",
            default: "now()",
          },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: "subcategories",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
          },
          {
            name: "categoryId",
            type: "uuid",
          },
          {
            name: "userId",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "name",
            type: "varchar",
          },
          {
            name: "createdAt",
            type: "timestamp",
            default: "now()",
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      "subcategories",
      new TableForeignKey({
        columnNames: ["categoryId"],
        referencedColumnNames: ["id"],
        referencedTableName: "categories",
        onDelete: "CASCADE",
      }),
    );

    // Seed SYSTEM categories
    await queryRunner.query(`
      INSERT INTO "categories" ("id", "name", "type", "icon", "color", "isSystem", "createdAt")
      VALUES 
        ('11111111-1111-1111-1111-111111111111', 'Cybersecurity & SaaS', 'EXPENSE', 'shield-check', '#3b82f6', true, now()),
        ('22222222-2222-2222-2222-222222222222', 'Aluguel & Infraestrutura', 'EXPENSE', 'building-office-2', '#6366f1', true, now()),
        ('33333333-3333-3333-3333-333333333333', 'Investimentos em Renda Fixa', 'INVESTMENT', 'chart-bar', '#10b981', true, now()),
        ('44444444-4444-4444-4444-444444444444', 'Saúde & Benefícios', 'EXPENSE', 'heart', '#ec4899', true, now())
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const subcatTable = await queryRunner.getTable("subcategories");
    if (subcatTable) {
      const foreignKey = subcatTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf("categoryId") !== -1,
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey("subcategories", foreignKey);
      }
    }

    await queryRunner.dropTable("subcategories");
    await queryRunner.dropTable("categories");
  }
}
