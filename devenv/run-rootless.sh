#!/bin/bash
set -e
cd "$(dirname "$0")"

if (( $# < 1 ))
then
      echo "Usage run-rootless.sh up/down"
      exit 1
fi

COMMAND=$1

# create data directory if it doesn't exist
if [ ! -d postgres-data ]; then
  echo creating data dir...
  mkdir postgres-data;
fi

# copy /etc/passwd
ETC_PASSWD=`mktemp`
cp /etc/passwd $ETC_PASSWD

RUNAS_UID="$(id -u)"
RUNAS_GID="$(id -g)"

case $COMMAND in
    verbose)
        ETC_PASSWD=$ETC_PASSWD RUNAS_UID=$RUNAS_UID RUNAS_GID=$RUNAS_GID docker compose -f docker-compose-rootless.yml --verbose up 
    ;;
    up)
        ETC_PASSWD=$ETC_PASSWD RUNAS_UID=$RUNAS_UID RUNAS_GID=$RUNAS_GID docker compose -f docker-compose-rootless.yml up -d
    ;;
    down)
        ETC_PASSWD=$ETC_PASSWD RUNAS_UID=$RUNAS_UID RUNAS_GID=$RUNAS_GID docker compose -f docker-compose-rootless.yml down
    ;;
esac