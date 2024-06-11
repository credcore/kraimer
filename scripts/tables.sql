-- Table: file_content
CREATE TABLE IF NOT EXISTS file_content (
  id BIGSERIAL PRIMARY KEY,
  file_path VARCHAR NOT NULL,
  content BYTEA NOT NULL,
  content_type VARCHAR NOT NULL
);

-- Table: document
CREATE TABLE IF NOT EXISTS document (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR UNIQUE,
  description VARCHAR,
  type VARCHAR,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  file_content_id BIGINT REFERENCES file_content(id)
);

-- Table: document_group
CREATE TABLE IF NOT EXISTS document_group (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR UNIQUE,
  description VARCHAR,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: document_group_document
CREATE TABLE IF NOT EXISTS document_group_document (
  id BIGSERIAL PRIMARY KEY,
  document_group_id BIGINT REFERENCES document_group(id),
  document_id BIGINT REFERENCES document(id)
);

-- Table: document_property
CREATE TABLE IF NOT EXISTS document_property (
  id BIGSERIAL PRIMARY KEY,
  document_id BIGINT REFERENCES document(id),
  name VARCHAR,
  value VARCHAR,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: document_group_property
CREATE TABLE IF NOT EXISTS document_group_property (
  id BIGSERIAL PRIMARY KEY,
  document_group_id BIGINT REFERENCES document_group(id),
  name VARCHAR,
  value VARCHAR,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: extraction
CREATE TABLE IF NOT EXISTS extraction (
  id BIGSERIAL PRIMARY KEY,
  document_group_id BIGINT REFERENCES document_group(id),
  name VARCHAR UNIQUE,
  status VARCHAR,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: extracted_field
CREATE TABLE IF NOT EXISTS extracted_field (
  id BIGSERIAL PRIMARY KEY,
  extraction_id BIGINT REFERENCES extraction(id),
  name VARCHAR,
  value VARCHAR,
  strategy VARCHAR,
  status VARCHAR,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (extraction_id, name)
);

-- Table: extraction_property
CREATE TABLE IF NOT EXISTS extraction_property (
  id BIGSERIAL PRIMARY KEY,
  extraction_id BIGINT REFERENCES extraction(id),
  name VARCHAR,
  value VARCHAR,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: extracted_field_error
CREATE TABLE IF NOT EXISTS extracted_field_error (
  id BIGSERIAL PRIMARY KEY,
  extracted_field_id BIGINT REFERENCES extracted_field(id),
  message VARCHAR,
  data VARCHAR,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: llm_response
CREATE TABLE IF NOT EXISTS llm_response (
  id BIGSERIAL PRIMARY KEY,
  llm VARCHAR,
  model VARCHAR,
  prompt_hash VARCHAR,
  prompt TEXT,
  response_id VARCHAR,
  response TEXT,
  finish_reason VARCHAR,
  prompt_tokens INT,
  completion_tokens INT,
  total_tokens INT,
  error VARCHAR,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (prompt_hash, model, llm)
);
