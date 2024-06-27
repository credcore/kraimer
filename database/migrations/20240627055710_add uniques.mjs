/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema
    .alterTable("document_property", function (table) {
      table.unique(
        ["document_id", "name"],
        "document_property_document_id_name_unique"
      );
    })
    .alterTable("document_group_property", function (table) {
      table.unique(
        ["document_group_id", "name"],
        "document_group_property_document_group_id_name_unique"
      );
    })
    .alterTable("extraction_property", function (table) {
      table.unique(
        ["extraction_id", "name"],
        "extraction_property_extraction_id_name_unique"
      );
    })
    .alterTable("extracted_field", function (table) {
      table.unique(
        ["extraction_id", "name"],
        "extracted_field_extraction_id_name_unique"
      );
    });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema
    .alterTable("document_property", function (table) {
      table.dropUnique(
        ["document_id", "name"],
        "document_property_document_id_name_unique"
      );
    })
    .alterTable("document_group_property", function (table) {
      table.dropUnique(
        ["document_group_id", "name"],
        "document_group_property_document_group_id_name_unique"
      );
    })
    .alterTable("extraction_property", function (table) {
      table.dropUnique(
        ["extraction_id", "name"],
        "extraction_property_extraction_id_name_unique"
      );
    })
    .alterTable("extracted_field", function (table) {
      table.dropUnique(
        ["extraction_id", "name"],
        "extracted_field_extraction_id_name_unique"
      );
    });
}
