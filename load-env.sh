#!/bin/bash
# Load environment variables from .env file and export them

set -a  # Automatically export all variables
source .env
set +a  # Stop automatically exporting variables