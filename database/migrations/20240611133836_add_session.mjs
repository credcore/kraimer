/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
  await knex.schema.createTable("session", (table) => {
    table.string("session").primary();
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });

  await knex.schema.table("llm_response", (table) => {
    table.string("session").notNullable();
    table.foreign("session").references("session.session");
  });

  await knex.schema.table("extracted_field", (table) => {
    table.string("session").notNullable();
    table.foreign("session").references("session.session");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
  await knex.schema.table("llm_response", (table) => {
    table.dropForeign("session");
    table.dropColumn("session");
  });

  await knex.schema.table("extracted_field", (table) => {
    table.dropForeign("session");
    table.dropColumn("session");
  });

  await knex.schema.dropTable("session");
};
