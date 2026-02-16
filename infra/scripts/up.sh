#!/usr/bin/env sh
# Lance DB + API + web. Usage : infra/scripts/up.sh
set -e
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
[ -f "$ROOT/backend/.env" ] || { cp "$ROOT/backend/.env.example" "$ROOT/backend/.env"; echo "backend/.env créé depuis .env.example"; }
mkdir -p "$ROOT/backend/receipts"
docker compose -f "$ROOT/infra/docker-compose.yml" up -d --build
echo "Web : http://localhost:5173 | API : http://localhost:4000 | Swagger : http://localhost:4000/api-docs"
