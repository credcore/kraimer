#!/bin/bash
set -e
cd "$(dirname "$0")"

PGPASSWORD=postgres psql -h 0.0.0.0 -p 5432 -U postgres -f ./init.sql
