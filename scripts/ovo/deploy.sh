#!/usr/bin/env bash
set -euo pipefail

BUNDLE_DIR="${OVO_BUNDLE_DIR:-$(pwd)}"
TARGET_ROOT="${OVO_DEPLOY_TARGET_ROOT:-/opt/codia}"
DOCKER_NETWORK="${OVO_DOCKER_NETWORK:-web}"
COMPOSE_PROJECT_NAME="${OVO_COMPOSE_PROJECT_NAME:-codia}"
CODIA_DATA_ROOT="${CODIA_DATA_ROOT:-$TARGET_ROOT/data}"
CODIA_DB_PATH="${CODIA_DB_PATH:-/app/data/codia.sqlite}"

export CODIA_DATA_ROOT
export CODIA_DB_PATH

echo "[codia] deploy bundle=$BUNDLE_DIR target=$TARGET_ROOT data=$CODIA_DATA_ROOT"

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is required" >&2
  exit 1
fi

if ! docker network inspect "$DOCKER_NETWORK" >/dev/null 2>&1; then
  docker network create "$DOCKER_NETWORK" >/dev/null
fi

mkdir -p "$TARGET_ROOT" "$CODIA_DATA_ROOT"
NEXT_ROOT="${TARGET_ROOT}/.next"
rm -rf "$NEXT_ROOT"
mkdir -p "$NEXT_ROOT"

tar -C "$BUNDLE_DIR" \
  --exclude "./artifact.zip" \
  -cf - . | tar -C "$NEXT_ROOT" -xf -

BACKUP_ROOT="${TARGET_ROOT}/.previous"
rm -rf "$BACKUP_ROOT"
mkdir -p "$BACKUP_ROOT"

find "$TARGET_ROOT" -mindepth 1 -maxdepth 1 \
  ! -name "data" \
  ! -name ".next" \
  ! -name ".previous" \
  -exec mv {} "$BACKUP_ROOT"/ \;

tar -C "$NEXT_ROOT" -cf - . | tar -C "$TARGET_ROOT" -xf -
rm -rf "$NEXT_ROOT"

cd "$TARGET_ROOT"

DB_RELATIVE_PATH="${CODIA_DB_PATH#/app/data/}"
if [ "$DB_RELATIVE_PATH" = "$CODIA_DB_PATH" ]; then
  DB_RELATIVE_PATH="$(basename "$CODIA_DB_PATH")"
fi
DB_FILE="$CODIA_DATA_ROOT/$DB_RELATIVE_PATH"
mkdir -p "$(dirname "$DB_FILE")"

FIRST_DB_INIT="false"
if [ ! -f "$DB_FILE" ]; then
  FIRST_DB_INIT="true"
fi

docker compose -p "$COMPOSE_PROJECT_NAME" build codia

if [ "$FIRST_DB_INIT" = "true" ]; then
  echo "[codia] first sqlite init: $DB_FILE"
  docker compose -p "$COMPOSE_PROJECT_NAME" run --rm --no-deps codia npm run db:init
else
  echo "[codia] sqlite already exists, skip first init: $DB_FILE"
fi

docker compose -p "$COMPOSE_PROJECT_NAME" up -d --no-build --remove-orphans

bash scripts/ovo/healthcheck.sh
