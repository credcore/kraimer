/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema
    .createTable("file_content", function (table) {
      table.bigIncrements("id").primary();
      table.text("file_path").notNullable();
      table.binary("content").notNullable();
      table.text("content_type").notNullable();
    })
    .createTable("document", function (table) {
      table.bigIncrements("id").primary();
      table.text("name").unique();
      table.text("description");
      table.text("type");
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table
        .bigInteger("file_content_id")
        .references("id")
        .inTable("file_content");
    })
    .createTable("document_group", function (table) {
      table.bigIncrements("id").primary();
      table.text("name").unique();
      table.text("description");
      table.timestamp("created_at").defaultTo(knex.fn.now());
    })
    .createTable("document_group_document", function (table) {
      table.bigIncrements("id").primary();
      table
        .bigInteger("document_group_id")
        .references("id")
        .inTable("document_group");
      table.bigInteger("document_id").references("id").inTable("document");
    })
    .createTable("document_property", function (table) {
      table.bigIncrements("id").primary();
      table.bigInteger("document_id").references("id").inTable("document");
      table.text("name");
      table.text("value");
      table.timestamp("created_at").defaultTo(knex.fn.now());
    })
    .createTable("document_group_property", function (table) {
      table.bigIncrements("id").primary();
      table
        .bigInteger("document_group_id")
        .references("id")
        .inTable("document_group");
      table.text("name");
      table.text("value");
      table.timestamp("created_at").defaultTo(knex.fn.now());
    })
    .createTable("extraction", function (table) {
      table.bigIncrements("id").primary();
      table
        .bigInteger("document_group_id")
        .references("id")
        .inTable("document_group");
      table.text("name").unique();
      table.text("status");
      table.timestamp("created_at").defaultTo(knex.fn.now());
    })
    .createTable("extracted_field", function (table) {
      table.bigIncrements("id").primary();
      table.bigInteger("extraction_id").references("id").inTable("extraction");
      table.text("name");
      table.text("value");
      table.text("strategy");
      table.text("status");
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.unique(["extraction_id", "name"]);
    })
    .createTable("extraction_property", function (table) {
      table.bigIncrements("id").primary();
      table.bigInteger("extraction_id").references("id").inTable("extraction");
      table.text("name");
      table.text("value");
      table.timestamp("created_at").defaultTo(knex.fn.now());
    })
    .createTable("extracted_field_error", function (table) {
      table.bigIncrements("id").primary();
      table
        .bigInteger("extracted_field_id")
        .references("id")
        .inTable("extracted_field");
      table.text("message");
      table.text("data");
      table.timestamp("created_at").defaultTo(knex.fn.now());
    })
    .createTable("llm_response", function (table) {
      table.bigIncrements("id").primary();
      table.text("llm");
      table.text("model");
      table.text("prompt_hash");
      table.text("prompt");
      table.text("response_id");
      table.text("response");
      table.text("finish_reason");
      table.integer("prompt_tokens");
      table.integer("completion_tokens");
      table.integer("total_tokens");
      table.text("error");
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.unique(["prompt_hash", "model", "llm"]);
    });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema
    .dropTableIfExists("llm_response")
    .dropTableIfExists("extracted_field_error")
    .dropTableIfExists("extraction_property")
    .dropTableIfExists("extracted_field")
    .dropTableIfExists("extraction")
    .dropTableIfExists("document_group_property")
    .dropTableIfExists("document_property")
    .dropTableIfExists("document_group_document")
    .dropTableIfExists("document_group")
    .dropTableIfExists("document")
    .dropTableIfExists("file_content");
}
