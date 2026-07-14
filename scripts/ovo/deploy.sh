#!/usr/bin/env bash
set -euo pipefail

BUNDLE_DIR="${OVO_BUNDLE_DIR:-$(pwd)}"

load_env_defaults() {
  local env_file="$1"

  if [ ! -f "$env_file" ]; then
    echo "[codia] bundle env not found: $env_file"
    return
  fi

  echo "[codia] loading bundle env defaults: $env_file"
  while IFS='=' read -r key value || [ -n "$key" ]; do
    case "$key" in
      ''|\#*) continue ;;
    esac

    if ! [[ "$key" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]]; then
      continue
    fi

    if [ -z "${!key+x}" ]; then
      export "$key=$value"
    fi
  done < "$env_file"
}

print_debug_value() {
  local key="$1"
  local value="${!key:-}"

  if [ -z "$value" ]; then
    echo "[codia] env $key=<empty>"
  else
    echo "[codia] env $key=$value"
  fi
}

load_env_defaults "$BUNDLE_DIR/.env"

TARGET_ROOT="${OVO_DEPLOY_TARGET_ROOT:-/opt/codia}"
DOCKER_NETWORK="${OVO_DOCKER_NETWORK:-web}"
COMPOSE_PROJECT_NAME="${OVO_COMPOSE_PROJECT_NAME:-codia}"
CODIA_DATA_ROOT="${CODIA_DATA_ROOT:-$TARGET_ROOT/data}"
CODIA_DB_PATH="${CODIA_DB_PATH:-/app/data/codia.sqlite}"

export CODIA_DATA_ROOT
export CODIA_DB_PATH

echo "[codia] deploy bundle=$BUNDLE_DIR target=$TARGET_ROOT data=$CODIA_DATA_ROOT"
echo "[codia] deploy started at $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
print_debug_value APP_VERSION
print_debug_value OVO_RELEASE_VERSION
print_debug_value OVO_RELEASE_COMMIT
print_debug_value OVO_DEPLOY_TARGET_ROOT
print_debug_value OVO_DOCKER_NETWORK
print_debug_value OVO_COMPOSE_PROJECT_NAME
print_debug_value OVO_CONTAINER_NAME
print_debug_value CODIA_DATA_ROOT
print_debug_value CODIA_DB_PATH
print_debug_value CODIA_HOST_PORT
print_debug_value OVO_HEALTHCHECK_URL

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is required" >&2
  exit 1
fi

docker --version
docker compose version

if ! docker network inspect "$DOCKER_NETWORK" >/dev/null 2>&1; then
  echo "[codia] docker network missing, creating: $DOCKER_NETWORK"
  docker network create "$DOCKER_NETWORK" >/dev/null
else
  echo "[codia] docker network exists: $DOCKER_NETWORK"
fi

mkdir -p "$TARGET_ROOT" "$CODIA_DATA_ROOT"
echo "[codia] target root permissions: $(ls -ld "$TARGET_ROOT")"
echo "[codia] sqlite data root permissions: $(ls -ld "$CODIA_DATA_ROOT")"

NEXT_ROOT="${TARGET_ROOT}/.next"
rm -rf "$NEXT_ROOT"
mkdir -p "$NEXT_ROOT"

echo "[codia] copying bundle into next release dir: $NEXT_ROOT"
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

echo "[codia] sqlite expected host path: $DB_FILE"
echo "[codia] sqlite first init required: $FIRST_DB_INIT"
echo "[codia] compose config preview:"
docker compose -p "$COMPOSE_PROJECT_NAME" config | sed -n '1,220p'

docker compose -p "$COMPOSE_PROJECT_NAME" build codia

if [ "$FIRST_DB_INIT" = "true" ]; then
  echo "[codia] first sqlite init: $DB_FILE"
  docker compose -p "$COMPOSE_PROJECT_NAME" run --rm --no-deps codia npm run db:init
else
  echo "[codia] sqlite already exists, skip first init: $DB_FILE"
fi

docker compose -p "$COMPOSE_PROJECT_NAME" up -d --no-build --remove-orphans
docker compose -p "$COMPOSE_PROJECT_NAME" ps

bash scripts/ovo/healthcheck.sh
