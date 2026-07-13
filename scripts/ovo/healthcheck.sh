#!/usr/bin/env bash
set -euo pipefail

URL="${OVO_HEALTHCHECK_URL:-http://127.0.0.1:${CODIA_HOST_PORT:-3000}/api/health}"
TIMEOUT_SECONDS="${OVO_HEALTHCHECK_TIMEOUT_SECONDS:-60}"
DEADLINE=$((SECONDS + TIMEOUT_SECONDS))

echo "[codia] healthcheck url=$URL timeout=${TIMEOUT_SECONDS}s"

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
