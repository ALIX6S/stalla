#!/usr/bin/env sh
# Arrête la stack. Usage : infra/scripts/down.sh [--purge]  (--purge supprime base et caches)
set -e
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
if [ "$1" = "--purge" ]; then
  docker compose -f "$ROOT/infra/docker-compose.yml" --profile mobile down -v --rmi local
else
  docker compose -f "$ROOT/infra/docker-compose.yml" down
fi
