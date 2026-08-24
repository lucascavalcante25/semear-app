#!/usr/bin/env bash
# Exporta Supabase (session pooler :5432) e restaura no Postgres local do compose.
# Uso na VPS:
#   export SUPABASE_DB_PASSWORD='sua-senha-supabase'
#   bash deploy/contabo/migrate-from-supabase.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
COMPOSE=(docker compose -f "$ROOT/deploy/contabo/docker-compose.yml")
DUMP="/tmp/semear-supabase.dump"

SUPABASE_HOST="${SUPABASE_HOST:-aws-1-sa-east-1.pooler.supabase.com}"
SUPABASE_PORT="${SUPABASE_PORT:-5432}"
SUPABASE_DB="${SUPABASE_DB:-postgres}"
SUPABASE_USER="${SUPABASE_USER:-postgres.kispyyzjnagqxblqvnga}"

if [[ -z "${SUPABASE_DB_PASSWORD:-}" ]]; then
  echo "Defina SUPABASE_DB_PASSWORD (senha do banco Supabase / Render SEMEAR_DB_PASSWORD)."
  exit 1
fi

NETWORK="$("${COMPOSE[@]}" ps -q db | xargs docker inspect -f '{{range $k, $v := .NetworkSettings.Networks}}{{$k}}{{end}}' | head -1)"

echo "==> Parando API..."
"${COMPOSE[@]}" stop api

echo "==> Dump Supabase (Postgres 17 via Docker) -> $DUMP"
docker run --rm \
  -e PGPASSWORD="$SUPABASE_DB_PASSWORD" \
  -e PGSSLMODE=require \
  postgres:17-alpine pg_dump \
  -h "$SUPABASE_HOST" \
  -p "$SUPABASE_PORT" \
  -U "$SUPABASE_USER" \
  -d "$SUPABASE_DB" \
  -Fc --no-owner --no-acl \
  > "$DUMP"

echo "==> Restore no Postgres local (pg_restore 17 via Docker)..."
docker run --rm -i --network "$NETWORK" \
  -e PGPASSWORD="${POSTGRES_PASSWORD:?Defina POSTGRES_PASSWORD no .env}" \
  postgres:17-alpine pg_restore \
  -h db -U semear -d semear \
  --clean --if-exists --no-owner --no-acl \
  < "$DUMP" || true

echo "==> Subindo API..."
"${COMPOSE[@]}" up -d api

echo "==> Health:"
sleep 8
curl -sf "http://127.0.0.1:8080/management/health" && echo

echo "Concluído. Teste login no app com um usuário existente."
