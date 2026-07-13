#!/usr/bin/env bash
set -euo pipefail

TARGET_ROOT="${OVO_DEPLOY_TARGET_ROOT:-/opt/codia}"
COMPOSE_PROJECT_NAME="${OVO_COMPOSE_PROJECT_NAME:-codia}"

if [ ! -d "$TARGET_ROOT" ]; then
  echo "target root not found: $TARGET_ROOT"
  exit 1
fi

cd "$TARGET_ROOT"
docker compose -p "$COMPOSE_PROJECT_NAME" ps
