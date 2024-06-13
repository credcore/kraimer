#!/bin/bash

# Function to show usage information
usage() {
    echo "Usage: $0 --env <path-to-env-file> --out <path-to-output-file>"
    echo "Options:"
    echo "  --env   Specify the path to the .env.development.local file"
    echo "  --out   Specify the path to the output SQL file where CREATE TABLE statements will be saved"
    exit 1
}

# Function to parse .env file
parse_env() {
    if [ ! -f "$1" ]; then
        echo "Error: .env file not found at $1"
        exit 1
    fi
    export $(cat $1 | xargs)
}

# Function to generate CREATE TABLE statements
generate_tables() {
    # Use the database credentials from the .env file
    export PGPASSWORD="$KRAIMER_DB_PASS"
    
    # Start transaction
    echo "BEGIN;" > "$2"
    echo "-- Generated SQL statements" >> "$2"

    # Fetch table definitions
    TABLES=$(psql -h "$KRAIMER_DB_HOST" -U "$KRAIMER_DB_USER" -p "$DB_PORT" -d "$KRAIMER_DB_NAME" -t -A -c "SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname='public';")

    echo "-- CREATE TABLE statements" >> "$2"
    while read -r tablename; do
        if [[ ! -z "$tablename" ]]; then
            echo "Processing table: $tablename"

            # Start CREATE TABLE statement
            echo "CREATE TABLE \"$tablename\" (" >> "$2"
            
            # Columns with types, default values, and not null constraints, each on a new line
            psql -h "$KRAIMER_DB_HOST" -U "$KRAIMER_DB_USER" -p "$DB_PORT" -d "$KRAIMER_DB_NAME" -t -A -c \
            "SELECT '    \"' || column_name || '\" ' || data_type || CASE WHEN character_maximum_length IS NOT NULL THEN '(' || character_maximum_length || ')' ELSE '' END || CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END || CASE WHEN column_default IS NOT NULL THEN ' DEFAULT ' || column_default ELSE '' END FROM information_schema.columns WHERE table_name = '$tablename';" | sed '$!s/$/,/' >> "$2"
            
            # End CREATE TABLE statement and add a newline for readability
            echo ");" >> "$2"
            echo "" >> "$2"
        fi
    done <<< "$TABLES"

    echo "-- Unique Constraints statements" >> "$2"

    # Append all Unique constraints at once after CREATE TABLE statements
    psql -h "$KRAIMER_DB_HOST" -U "$KRAIMER_DB_USER" -p "$DB_PORT" -d "$KRAIMER_DB_NAME" -t -A -c \
    "SELECT 'ALTER TABLE \"' || tc.table_name || '\" ADD CONSTRAINT \"' || tc.constraint_name || '\" UNIQUE (\"' || string_agg(kcu.column_name, '\", \"') || '\");' FROM information_schema.table_constraints AS tc JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name WHERE tc.constraint_type = 'UNIQUE' AND tc.table_schema = 'public' GROUP BY tc.table_name, tc.constraint_name;" >> "$2"

    echo "-- Foreign Key and Index statements" >> "$2"

    # Append all Foreign Key constraints at once after CREATE TABLE statements
    psql -h "$KRAIMER_DB_HOST" -U "$KRAIMER_DB_USER" -p "$DB_PORT" -d "$KRAIMER_DB_NAME" -t -A -c \
    "SELECT 'ALTER TABLE \"' || tc.table_name || '\" ADD CONSTRAINT \"' || tc.constraint_name || '\" FOREIGN KEY (\"' || kcu.column_name || '\") REFERENCES \"' || ccu.table_name || '\"(\"' || ccu.column_name || '\") MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;' FROM information_schema.table_constraints AS tc JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public';" >> "$2"
    
    # Append Indexes (excluding primary keys and unique constraints)
    psql -h "$KRAIMER_DB_HOST" -U "$KRAIMER_DB_USER" -p "$DB_PORT" -d "$KRAIMER_DB_NAME" -t -A -c \
    "SELECT 'CREATE INDEX ON \"' || tablename || '\" USING ' || indexdef || ';' FROM pg_indexes WHERE schemaname = 'public' AND indexname NOT IN (SELECT constraint_name FROM information_schema.table_constraints WHERE constraint_type IN ('PRIMARY KEY', 'UNIQUE') AND table_schema = 'public');" >> "$2"
    
    # End transaction
    echo "COMMIT;" >> "$2"

    echo "Schema saved to $2"
    
    unset PGPASSWORD
}

# Main script logic
if [ $# -ne 4 ]; then
    usage
fi

while [ $# -gt 0 ]; do
    case "$1" in
        --env)
            ENV_PATH="$2"
            shift 2
            ;;
        --out)
            OUT_PATH="$2"
            shift 2
            ;;
        *)
            usage
            ;;
    esac
done

if [ -z "$ENV_PATH" ] || [ -z "$OUT_PATH" ]; then
    usage
fi

parse_env "$ENV_PATH"
generate_tables "$ENV_PATH" "$OUT_PATH"
