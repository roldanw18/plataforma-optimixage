#!/usr/bin/env bash
# =============================================================================
# Optimixage - Setup automatizado (Linux / macOS / WSL)
# Uso: bash scripts/setup.sh
# =============================================================================
set -euo pipefail

echo "==> Verificando versiones..."
python3 --version
node --version
npm --version

PY_MAJOR=$(python3 -c 'import sys;print(sys.version_info[0])')
PY_MINOR=$(python3 -c 'import sys;print(sys.version_info[1])')
if [ "$PY_MAJOR" -lt 3 ] || { [ "$PY_MAJOR" -eq 3 ] && [ "$PY_MINOR" -lt 10 ]; }; then
  echo "ERROR: se requiere Python 3.10 o superior."
  exit 1
fi

# --- .env raiz -------------------------------------------------------------
if [ ! -f ".env" ]; then
  echo "==> Creando .env desde .env.example"
  cp .env.example .env
fi

# --- Backend ---------------------------------------------------------------
echo "==> Creando virtualenv backend..."
[ -d "venv" ] || python3 -m venv venv
# shellcheck disable=SC1091
source venv/bin/activate
python -m pip install --upgrade pip
pip install -r backend/requirements.txt

echo "==> Aplicando migraciones..."
( cd backend && alembic upgrade head )

# --- Frontend --------------------------------------------------------------
echo "==> Instalando dependencias frontend..."
[ -f "frontend/.env" ] || cp frontend/.env.example frontend/.env
( cd frontend && npm install )

echo ""
echo "Listo. Para iniciar:"
echo "  Backend:  bash scripts/dev-backend.sh"
echo "  Frontend: bash scripts/dev-frontend.sh"
