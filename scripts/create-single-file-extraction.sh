#!/bin/bash

# Change to the directory of the script
cd "$(dirname "$0")"

# Function to parse .env file
parse_env() {
    if [ ! -f "$1" ]; then
        echo "Error: .env file not found at $1"
        exit 1
    fi
    export $(cat $1 | xargs)
}

parse_env "../.env"

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

# Store the node command in a variable for reuse
NODE_CMD="node ../dist/index.js"

# Step 1: Create a document
create_document_output=$($NODE_CMD document create --type "$DOCUMENT_TYPE" --file-path "$FILE_PATH" --name "$DOCUMENT_NAME")
document_id=$(echo "$create_document_output" | jq -r '.id')

# Check if document_id is retrieved
if [ -z "$document_id" ]; then
    echo "Failed to create document."
    exit 1
fi

echo "Created document with ID: $document_id"

# Step 2: Create a document group
create_doc_group_output=$($NODE_CMD document-group create --name "$DOC_GROUP_NAME")
doc_group_id=$(echo "$create_doc_group_output" | jq -r '.id')

# Check if doc_group_id is retrieved
if [ -z "$doc_group_id" ]; then
    echo "Failed to create document group."
    exit 1
fi

echo "Created document group with ID: $doc_group_id"

# Step 3: Add document to the group
add_doc_output=$($NODE_CMD document-group add-document --document-group-id "$doc_group_id" --document-id "$document_id")

# Check if the document was added successfully by examining the exit status
if [ $? -ne 0 ]; then
    echo "Failed to add document to the document group."
    exit 1
fi

echo "Added document ID $document_id to document group ID $doc_group_id"

# Step 4: Create an extraction
add_extraction_output=$($NODE_CMD extraction create --name "$EXTRACTION_NAME" --document-group-id "$doc_group_id" --status started)
extraction_id=$(echo "$add_extraction_output" | jq -r '.id')

# Check if extraction_id is retrieved
if [ -z "$extraction_id" ]; then
    echo "Failed to create extraction."
    exit 1
fi

# Output to the user that the script has finished running.
echo "Extraction named $EXTRACTION_NAME with ID $extraction_id created for document group ID $doc_group_id"
