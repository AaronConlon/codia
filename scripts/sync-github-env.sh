#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  bash scripts/sync-github-env.sh [--dry-run]
  bash scripts/sync-github-env.sh --env-file .env.production --env production [--dry-run]

默认会同步当前目录下存在的 .env.production -> production、.env.test -> test。
本项目默认把 dotenv 里的所有 key 写入 GitHub Environment Secrets，方便 CI 统一通过 secrets.* 读取。

Options:
  --env-file <path>  指定 dotenv 文件
  --env <name>       指定 GitHub Environment 名称
  --dry-run          只打印计划，不写入 GitHub
  --classify         按 key 名称分类：token/password/secret/key 写 Secret，其余写 Variable
  -h, --help         显示帮助
EOF
}

trim() {
  local value="$1"
  value="${value#"${value%%[![:space:]]*}"}"
  value="${value%"${value##*[![:space:]]}"}"
  printf '%s' "$value"
}

strip_quotes() {
  local value="$1"
  if [[ "$value" == \"*\" && "$value" == *\" ]]; then
    value="${value:1:${#value}-2}"
  elif [[ "$value" == \'*\' && "$value" == *\' ]]; then
    value="${value:1:${#value}-2}"
  fi
  printf '%s' "$value"
}

is_secret_key() {
  local key_upper
  key_upper="$(printf '%s' "$1" | tr '[:lower:]' '[:upper:]')"
  [[ "$key_upper" =~ (TOKEN|PASSWORD|SECRET|PRIVATE|KEY|CREDENTIAL|AUTH|WEBHOOK|BUNDLE_ZIP_PASSWORD) ]]
}

sync_one_file() {
  local env_file="$1"
  local env_name="$2"

  if [ ! -f "$env_file" ]; then
    echo "skip missing env file: $env_file"
    return 0
  fi

  local repo
  repo="$(gh repo view --json nameWithOwner --jq '.nameWithOwner')"

  if [ -z "$repo" ]; then
    echo "failed to resolve GitHub repo" >&2
    exit 1
  fi

  echo "target_repo=$repo"
  echo "target_environment=$env_name"
  echo "source_file=$env_file"

  if [ "$DRY_RUN" != "1" ]; then
    gh api --method PUT "repos/${repo}/environments/${env_name}" >/dev/null
  fi

  local secret_count=0
  local variable_count=0
  local line key value target

  while IFS= read -r line || [ -n "$line" ]; do
    line="$(trim "$line")"
    [ -z "$line" ] && continue
    [[ "$line" == \#* ]] && continue

    if [[ "$line" == export\ * ]]; then
      line="$(trim "${line#export }")"
    fi

    if [[ ! "$line" =~ ^[A-Za-z_][A-Za-z0-9_]*= ]]; then
      echo "skip unsupported dotenv line: $line" >&2
      continue
    fi

    key="${line%%=*}"
    value="${line#*=}"
    value="$(strip_quotes "$(trim "$value")")"

    target="secret"
    if [ "$CLASSIFY" = "1" ] && ! is_secret_key "$key"; then
      target="variable"
    fi

    if [ "$DRY_RUN" = "1" ]; then
      echo "plan ${target}: ${key}"
    elif [ "$target" = "secret" ]; then
      printf '%s' "$value" | gh secret set "$key" --env "$env_name" >/dev/null
    else
      gh variable set "$key" --env "$env_name" --body "$value" >/dev/null
    fi

    if [ "$target" = "secret" ]; then
      secret_count=$((secret_count + 1))
    else
      variable_count=$((variable_count + 1))
    fi
  done < "$env_file"

  echo "synced ${secret_count} secrets and ${variable_count} variables to ${env_name}"
}

DRY_RUN=0
CLASSIFY=0
ENV_FILE=""
ENV_NAME=""

while [ "$#" -gt 0 ]; do
  case "$1" in
    --dry-run)
      DRY_RUN=1
      shift
      ;;
    --classify)
      CLASSIFY=1
      shift
      ;;
    --env-file)
      ENV_FILE="${2:-}"
      shift 2
      ;;
    --env)
      ENV_NAME="${2:-}"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "unknown argument: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

if ! command -v gh >/dev/null 2>&1; then
  echo "gh CLI is required. Run: gh auth login" >&2
  exit 1
fi

if [ -n "$ENV_FILE" ] || [ -n "$ENV_NAME" ]; then
  if [ -z "$ENV_FILE" ] || [ -z "$ENV_NAME" ]; then
    echo "--env-file and --env must be provided together" >&2
    exit 1
  fi
  sync_one_file "$ENV_FILE" "$ENV_NAME"
  exit 0
fi

found=0
if [ -f ".env.production" ]; then
  found=1
  sync_one_file ".env.production" "production"
fi

if [ -f ".env.test" ]; then
  found=1
  sync_one_file ".env.test" "test"
fi

if [ "$found" = "0" ]; then
  echo "no .env.production or .env.test found" >&2
  exit 1
fi
