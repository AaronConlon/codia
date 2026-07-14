#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT_BUNDLE_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

load_env_defaults() {
  local env_file="$1"

  if [ ! -f "$env_file" ]; then
    echo "[codia] env file not found: $env_file"
    return
  fi

  echo "[codia] loading env defaults: $env_file"
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

load_env_defaults "${OVO_BUNDLE_DIR:-$SCRIPT_BUNDLE_DIR}/.env"
load_env_defaults "${OVO_DEPLOY_TARGET_ROOT:-$(pwd)}/.env"

URL="${OVO_HEALTHCHECK_URL:-http://127.0.0.1:${CODIA_HOST_PORT:-3000}/api/health}"
TIMEOUT_SECONDS="${OVO_HEALTHCHECK_TIMEOUT_SECONDS:-60}"
DEADLINE=$((SECONDS + TIMEOUT_SECONDS))

echo "[codia] healthcheck url=$URL timeout=${TIMEOUT_SECONDS}s"
echo "[codia] healthcheck bundle_dir=${OVO_BUNDLE_DIR:-$SCRIPT_BUNDLE_DIR}"
echo "[codia] healthcheck target_root=${OVO_DEPLOY_TARGET_ROOT:-$(pwd)}"

while [ "$SECONDS" -lt "$DEADLINE" ]; do
  if curl -fsS "$URL" >/tmp/codia-healthcheck.json; then
    cat /tmp/codia-healthcheck.json
    echo
    exit 0
  fi
  sleep 2
done

echo "healthcheck failed: $URL" >&2
exit 1
