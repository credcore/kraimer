#!/bin/bash

# The script takes either one ID or a range of IDs

# Function to delete a single record
delete_single() {
    echo "Deleting record with ID: $1"
    psql -h $KRAIMER_DB_HOST -d $KRAIMER_DB_NAME -U $KRAIMER_DB_USER -c "DELETE FROM llm_response WHERE id = $1;"
}

# Function to delete a range of records
delete_range() {
    echo "Deleting records from ID: $1 to ID: $2"
    psql -h $KRAIMER_DB_HOST -d $KRAIMER_DB_NAME -U $KRAIMER_DB_USER -c "DELETE FROM llm_response WHERE id BETWEEN $1 AND $2;"
}

# Check if environment variables are set
if [ -z "$KRAIMER_DB_HOST" ] || [ -z "$KRAIMER_DB_NAME" ] || [ -z "$KRAIMER_DB_USER" ] || [ -z "$KRAIMER_DB_PASS" ]; then
    echo "Database environment variables are not set. Please set KRAIMER_DB_HOST, KRAIMER_DB_NAME, KRAIMER_DB_USER, and KRAIMER_DB_PASS."
    exit 1
fi

# Check arguments and call the appropriate function
if [ "$1" == "--range" ]; then
    if [ $# -eq 3 ]; then
        delete_range $2 $3
    else
        echo "Invalid arguments. Usage: delete-llm-responses.sh --range <from_id> <to_id>"
        exit 1
    fi
    elif [ $# -eq 1 ]; then
    delete_single $1
else
    echo "Invalid arguments. Usage: delete-llm-responses.sh <id> OR delete-llm-responses.sh --range <from_id> <to_id>"
    exit 1
fi
