#!/usr/bin/env bash
set -euo pipefail

BUNDLE_DIR="${OVO_BUNDLE_DIR:-$(pwd)}"
TARGET_ROOT="${OVO_DEPLOY_TARGET_ROOT:-/opt/codia}"
DOCKER_NETWORK="${OVO_DOCKER_NETWORK:-web}"
COMPOSE_PROJECT_NAME="${OVO_COMPOSE_PROJECT_NAME:-codia}"

echo "[codia] deploy bundle=$BUNDLE_DIR target=$TARGET_ROOT"

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is required" >&2
  exit 1
fi

if ! docker network inspect "$DOCKER_NETWORK" >/dev/null 2>&1; then
  docker network create "$DOCKER_NETWORK" >/dev/null
fi

mkdir -p "$TARGET_ROOT"
NEXT_ROOT="${TARGET_ROOT}.next"
rm -rf "$NEXT_ROOT"
mkdir -p "$NEXT_ROOT"

tar -C "$BUNDLE_DIR" \
  --exclude "./artifact.zip" \
  -cf - . | tar -C "$NEXT_ROOT" -xf -

if [ -e "$TARGET_ROOT" ]; then
  BACKUP_ROOT="${TARGET_ROOT}.previous"
  rm -rf "$BACKUP_ROOT"
  mv "$TARGET_ROOT" "$BACKUP_ROOT"
fi

mv "$NEXT_ROOT" "$TARGET_ROOT"

cd "$TARGET_ROOT"
docker compose -p "$COMPOSE_PROJECT_NAME" up -d --build --remove-orphans

bash scripts/ovo/healthcheck.sh
