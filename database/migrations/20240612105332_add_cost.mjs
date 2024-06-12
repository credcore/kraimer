/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
  return knex.schema.createTable("llm_cost", function (table) {
    table.bigIncrements("id").primary();
    table
      .bigInteger("extraction_id")
      .references("id")
      .inTable("extraction")
      .onDelete("CASCADE");
    table
      .bigInteger("llm_response_id")
      .references("id")
      .inTable("llm_response")
      .onDelete("CASCADE");
    table.decimal("cost").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
  return knex.schema.dropTableIfExists("llm_cost");
};
