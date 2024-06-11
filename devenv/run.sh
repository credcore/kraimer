#!/bin/bash
set -e
cd "$(dirname "$0")"

# Check if the script is being executed on Linux and if --force is not supplied
if [[ "$(uname)" == "Linux" ]]; then
    FORCE_FOUND=0
    for arg in "$@"; do
        if [[ "$arg" == "--force" ]]; then
            FORCE_FOUND=1
            break
        fi
    done

    if [[ "$FORCE_FOUND" -eq 0 ]]; then
        echo "On linux use the run-rootless.sh script. If you insist on running this script (run.sh) you must use the --force option."
        exit 1
    fi
fi

# Remove the --force argument for the rest of the script
for index in "$@"; do
    [ "$index" == "--force" ] && shift
done

if (( $# < 1 ))
then
  echo "Usage run.sh up/down"
  exit 1
fi

COMMAND=$1

case $COMMAND in
  verbose)
      docker compose --verbose up 
  ;;
  up)
      docker compose up -d
  ;;
  down)
      docker compose down
  ;;
esac
