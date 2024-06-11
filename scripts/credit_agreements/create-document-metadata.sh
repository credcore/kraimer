#!/bin/bash

set -e  # Exit immediately if a command exits with a non-zero status.

# Initialize the extraction_id variable
extraction_id=""

# Initialize the model variable
model=""

# Remaining arguments are captured and will be passed as-is
additional_params=()

# Process each argument
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --extraction_id)
            extraction_id="$2"
            shift 2  # Skip the value of --extraction_id as well
        ;;
        --model)
            model="$2"
            if [ "$model" == "auto" ]; then
                model="gpt-4"
            fi
            shift 2  # Skip the value of --model as well
        ;;
        *)
            additional_params+=("$1")  # Add other arguments to the additional_params array
            shift
        ;;
    esac
done

if [ -z "$extraction_id" ]; then
    echo "Error: --extraction_id must be supplied."
    exit 1
fi

# Define the base command for readability
base_command="python src/main.py"

# Function to echo and execute command
execute_command() {
    echo Running: "$1"
    eval "$1"
}

# Add the --model parameter only when it's specified
if [ -n "$model" ]; then
    model_param="--model $model"
else
    model_param=""
fi

# Execute each command one by one with the specified parameters and strategies
execute_command "$base_command ${additional_params[*]} extract field --extraction_id $extraction_id --strategy pdf/get_textareas"
execute_command "$base_command ${additional_params[*]} extract field --extraction_id $extraction_id --strategy pdf/sort_textareas"
execute_command "$base_command ${additional_params[*]} extract field --extraction_id $extraction_id --strategy pdf/get_line_height"
execute_command "$base_command ${additional_params[*]} extract field --extraction_id $extraction_id --strategy pdf/get_text"
execute_command "$base_command ${additional_params[*]} extract field --extraction_id $extraction_id --strategy pdf/get_auto_layout"
execute_command "$base_command ${additional_params[*]} $model_param extract field --extraction_id $extraction_id --strategy semantic/credit_agreements/extract_toc"
execute_command "$base_command ${additional_params[*]} $model_param extract field --extraction_id $extraction_id --strategy semantic/credit_agreements/get_definitions_pages"
execute_command "$base_command ${additional_params[*]} $model_param extract field --extraction_id $extraction_id --strategy semantic/credit_agreements/get_page_numbers_delta"
# execute_command "$base_command ${additional_params[*]} $model_param extract field --extraction_id $extraction_id --strategy semantic/credit_agreements/get_header_footer"
# execute_command "$base_command ${additional_params[*]} $model_param extract field --extraction_id $extraction_id --strategy semantic/credit_agreements/get_definitions_regex"
# execute_command "$base_command ${additional_params[*]} $model_param extract field --extraction_id $extraction_id --strategy semantic/credit_agreements/get_definitions"
# execute_command "$base_command ${additional_params[*]} $model_param extract field --extraction_id $extraction_id --strategy semantic/credit_agreements/get_sections_boundaries"
# execute_command "$base_command ${additional_params[*]} $model_param extract field --extraction_id $extraction_id --strategy semantic/credit_agreements/get_sections"
# execute_command "$base_command ${additional_params[*]} $model_param extract field --extraction_id $extraction_id --strategy formatters/credit_agreements/get_tuskai_document_metadata"