#!/bin/bash

# Check if the correct number of arguments are given
if [ "$#" -ne 5 ]; then
    echo "Usage: $0 <file-path> <document-type> <document-name> <doc-group-name> <extraction-name>"
    exit 1
fi

# Assigning input arguments to variables
FILE_PATH=$1
DOCUMENT_TYPE=$2
DOCUMENT_NAME=$3
DOC_GROUP_NAME=$4
EXTRACTION_NAME=$5

# Step 1: Create a document
create_document_output=$(node dist/index.js --print document create --type "$DOCUMENT_TYPE" --file-path "$FILE_PATH" --name "$DOCUMENT_NAME")
document_id=$(echo "$create_document_output" | grep -o '"id": [0-9]*' | grep -o '[0-9]*')

# Check if document_id is retrieved
if [ -z "$document_id" ]; then
    echo "Failed to create document."
    exit 1
fi

echo "Created document with ID: $document_id"

# Step 2: Create a document group
create_doc_group_output=$(node dist/index.js --print document-group create --name "$DOC_GROUP_NAME")
doc_group_id=$(echo "$create_doc_group_output" | grep -o '"id": [0-9]*' | grep -o '[0-9]*')

# Check if doc_group_id is retrieved
if [ -z "$doc_group_id" ]; then
    echo "Failed to create document group."
    exit 1
fi

echo "Created document group with ID: $doc_group_id"

# Step 3: Add document to the group
add_doc_output=$(node dist/index.js --print document-group add-document --document-group-id "$doc_group_id" --document-id "$document_id")

# There is no JSON output to parse here as per your description.
# You may want to add a check for successful addition by examining the output or the exit status.
echo "Added document ID $document_id to document group ID $doc_group_id"

# Step 4: Create an extraction
add_extraction_output=$(node dist/index.js --print extraction create --name "$EXTRACTION_NAME" --document-group-id "$doc_group_id" --status started)
extraction_id=$(echo "$add_extraction_output" | grep -o '"id": [0-9]*' | grep -o '[0-9]*')

# Output to the user that the script has finished running.
echo "Extraction named $EXTRACTION_NAME with id $extraction_id created for document group ID $doc_group_id"
