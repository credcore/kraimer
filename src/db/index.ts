import { readFileSync } from "fs";
import { join } from "path";
import pgPromise from "pg-promise";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { IClient } from "pg-promise/typescript/pg-subset.js";

let db: pgPromise.IDatabase<{}, IClient>;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function init() {
  const pgp = pgPromise({});
  // Preparing the connection details:
  const connection = {
    host: process.env.KRAIMER_DB_HOST,
    database: process.env.KRAIMER_DB_NAME,
    user: process.env.KRAIMER_DB_USER,
    password: process.env.KRAIMER_DB_PASS
  };

  // Creating a new database instance from the connection details:
  db = pgp(connection);

  const dbCreationScript = readFileSync(
    join(__dirname, "createDb.sql"),
    "utf8"
  ).toString();

  await db.none(dbCreationScript);
}

export function getDb() {
  return db;
}