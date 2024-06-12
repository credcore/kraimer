/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
  await knex.schema.table("llm_response", (table) => {
    table.decimal("cost", 18, 6).alter();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
  await knex.schema.table("llm_response", (table) => {
    table.decimal("cost", 10, 2).alter();
  });
};
