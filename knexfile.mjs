export default {
  client: "postgresql",
  connection: {
    database: process.env.KRAIMER_DB_NAME,
    user: process.env.KRAIMER_DB_USER,
    password: process.env.KRAIMER_DB_PASS,
    host: process.env.KRAIMER_DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
  },
  migrations: {
    directory: "database/migrations",
    tableName: "migrations",
    loadExtensions: [".js", ".mjs"],
  },
  seeds: {
    loadExtensions: [".js", ".mjs"],
  },
};
