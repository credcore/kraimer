import pgPromise from "pg-promise";
import { IClient } from "pg-promise/typescript/pg-subset.js";

let db: pgPromise.IDatabase<{}, IClient>;

export async function init() {
  const pgp = pgPromise({});
  // Preparing the connection details:
  const connection = {
    host: process.env.KRAIMER_DB_HOST,
    database: process.env.KRAIMER_DB_NAME,
    user: process.env.KRAIMER_DB_USER,
    password: process.env.KRAIMER_DB_PASS,
  };

  // Creating a new database instance from the connection details:
  db = pgp(connection);
}

export async function getDb() {
  if (!db) {
    await init();
  }
  return db;
}
