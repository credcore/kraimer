BEGIN;
-- Generated SQL statements
-- CREATE TABLE statements
CREATE TABLE "migrations" (
    "id" integer NOT NULL DEFAULT nextval('migrations_id_seq'::regclass),
    "batch" integer,
    "migration_time" timestamp with time zone,
    "name" character varying(255)
);

CREATE TABLE "migrations_lock" (
    "index" integer NOT NULL DEFAULT nextval('migrations_lock_index_seq'::regclass),
    "is_locked" integer
);

CREATE TABLE "file_content" (
    "id" bigint NOT NULL DEFAULT nextval('file_content_id_seq'::regclass),
    "content" bytea NOT NULL,
    "file_path" text NOT NULL,
    "content_type" text NOT NULL
);

CREATE TABLE "document" (
    "id" bigint NOT NULL DEFAULT nextval('document_id_seq'::regclass),
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "file_content_id" bigint,
    "name" text,
    "description" text,
    "type" text
);

CREATE TABLE "document_group" (
    "id" bigint NOT NULL DEFAULT nextval('document_group_id_seq'::regclass),
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "name" text,
    "description" text
);

CREATE TABLE "document_group_document" (
    "id" bigint NOT NULL DEFAULT nextval('document_group_document_id_seq'::regclass),
    "document_group_id" bigint,
    "document_id" bigint
);

CREATE TABLE "document_property" (
    "id" bigint NOT NULL DEFAULT nextval('document_property_id_seq'::regclass),
    "document_id" bigint,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "name" text,
    "value" text
);

CREATE TABLE "document_group_property" (
    "id" bigint NOT NULL DEFAULT nextval('document_group_property_id_seq'::regclass),
    "document_group_id" bigint,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "name" text,
    "value" text
);

CREATE TABLE "extraction" (
    "id" bigint NOT NULL DEFAULT nextval('extraction_id_seq'::regclass),
    "document_group_id" bigint,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "name" text,
    "status" text
);

CREATE TABLE "extracted_field" (
    "extraction_id" bigint,
    "id" bigint NOT NULL DEFAULT nextval('extracted_field_id_seq'::regclass),
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "status" text,
    "value" text,
    "name" text,
    "strategy" text
);

CREATE TABLE "extraction_property" (
    "id" bigint NOT NULL DEFAULT nextval('extraction_property_id_seq'::regclass),
    "extraction_id" bigint,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "name" text,
    "value" text
);

CREATE TABLE "extracted_field_error" (
    "id" bigint NOT NULL DEFAULT nextval('extracted_field_error_id_seq'::regclass),
    "extracted_field_id" bigint,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "message" text,
    "data" text
);

CREATE TABLE "llm_response" (
    "id" bigint NOT NULL DEFAULT nextval('llm_response_id_seq'::regclass),
    "prompt_tokens" integer,
    "completion_tokens" integer,
    "total_tokens" integer,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "response_id" text,
    "response" text,
    "finish_reason" text,
    "error" text,
    "llm" text,
    "model" text,
    "prompt_hash" text,
    "prompt" text
);

CREATE TABLE "llm_cost" (
    "id" bigint NOT NULL DEFAULT nextval('llm_cost_id_seq'::regclass),
    "extraction_id" bigint,
    "llm_response_id" bigint,
    "cost" numeric NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- Foreign Key and Index statements
ALTER TABLE "document" ADD CONSTRAINT "document_file_content_id_foreign" FOREIGN KEY ("file_content_id") REFERENCES "file_content"("id") MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE "document_group_document" ADD CONSTRAINT "document_group_document_document_group_id_foreign" FOREIGN KEY ("document_group_id") REFERENCES "document_group"("id") MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE "document_group_document" ADD CONSTRAINT "document_group_document_document_id_foreign" FOREIGN KEY ("document_id") REFERENCES "document"("id") MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE "document_property" ADD CONSTRAINT "document_property_document_id_foreign" FOREIGN KEY ("document_id") REFERENCES "document"("id") MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE "document_group_property" ADD CONSTRAINT "document_group_property_document_group_id_foreign" FOREIGN KEY ("document_group_id") REFERENCES "document_group"("id") MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE "extraction" ADD CONSTRAINT "extraction_document_group_id_foreign" FOREIGN KEY ("document_group_id") REFERENCES "document_group"("id") MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE "extracted_field" ADD CONSTRAINT "extracted_field_extraction_id_foreign" FOREIGN KEY ("extraction_id") REFERENCES "extraction"("id") MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE "extraction_property" ADD CONSTRAINT "extraction_property_extraction_id_foreign" FOREIGN KEY ("extraction_id") REFERENCES "extraction"("id") MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE "extracted_field_error" ADD CONSTRAINT "extracted_field_error_extracted_field_id_foreign" FOREIGN KEY ("extracted_field_id") REFERENCES "extracted_field"("id") MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE "llm_cost" ADD CONSTRAINT "llm_cost_extraction_id_foreign" FOREIGN KEY ("extraction_id") REFERENCES "extraction"("id") MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE "llm_cost" ADD CONSTRAINT "llm_cost_llm_response_id_foreign" FOREIGN KEY ("llm_response_id") REFERENCES "llm_response"("id") MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;
COMMIT;
