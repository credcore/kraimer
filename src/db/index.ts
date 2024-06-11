import { readFileSync } from "fs";
import { join } from "path";
import pgPromise from "pg-promise";
import pg from "pg-promise/typescript/pg-subset";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { get as getConfig } from "../config/index.js";

let db: pgPromise.IDatabase<{}, pg.IClient>;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function init() {
  const pgp = pgPromise({});
  // Preparing the connection details:
  // Creating a new database instance from the connection details:
  const config = getConfig();
  db = pgp(config.db);

  const dbCreationScript = readFileSync(
    join(__dirname, "createDb.sql"),
    "utf8"
  ).toString();

  await db.none(dbCreationScript);
}

export function getDb() {
  return db;
}
