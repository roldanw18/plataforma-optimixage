#!/usr/bin/env bash
set -euo pipefail
# shellcheck disable=SC1091
source venv/bin/activate
cd backend
exec uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
