#!/usr/bin/env bash
#
# Bring up a local PostgreSQL for development.
# Prefers Docker; falls back to printing instructions for a managed DB.
set -euo pipefail

cd "$(dirname "$0")/.."

# Make sure there's a .env to write DATABASE_URL into.
if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example"
fi

if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
  echo "Starting PostgreSQL via docker compose…"
  docker compose up -d db
  echo
  echo "Postgres is up on localhost:5432 (database/user/password: checkedout)."
  echo "Your .env DATABASE_URL is already pointed at it."
  echo
  echo "Next:  npm run setup    # generate client, create tables, seed demo data"
else
  cat <<'EOF'
Docker isn't available, so this script can't start Postgres for you.

Pick one:
  1. Install Docker Desktop, then re-run:  ./scripts/setup-db.sh
  2. Use a free managed Postgres (Neon or Supabase), then put its
     connection string in .env as DATABASE_URL, e.g.:
        DATABASE_URL="postgresql://USER:PASS@HOST/db?sslmode=require"
  3. On Debian/Ubuntu you can install Postgres directly:
        sudo apt-get install -y postgresql
        sudo -u postgres createuser --pwprompt checkedout
        sudo -u postgres createdb -O checkedout checkedout

Then run:  npm run setup
EOF
fi
