import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({
  path: path.join(
    process.cwd(),
    "../../../env-files/financial/.env.development",
  ),
});

export default new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432", 10),
  username: process.env.DB_USERNAME || "financial_system_user",
  password: process.env.DB_PASSWORD || "financial_system_passoword",
  database: process.env.DB_DATABASE || "financial_system",
  entities: [
    path.join(
      process.cwd(),
      "src/infrastructure/adapters/out/persistence/typeorm/*.orm-entity{.ts,.js}",
    ),
  ],
  migrations: [
    path.join(
      process.cwd(),
      "src/infrastructure/adapters/out/persistence/typeorm/migrations/*{.ts,.js}",
    ),
  ],
  synchronize: false,
});
