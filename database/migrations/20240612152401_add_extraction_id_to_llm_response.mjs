/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
  await knex.schema.table("llm_response", (table) => {
    table
      .integer("extraction_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("extraction")
      .onDelete("CASCADE")
      .index();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
  await knex.schema.table("llm_response", (table) => {
    table.dropColumn("extraction_id");
  });
};
