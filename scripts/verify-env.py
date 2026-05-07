"""
Diagnostico rapido del entorno backend.

Uso (con el venv activado):
    python scripts/verify-env.py

Comprueba:
  - Version de Python
  - .env presente y cargable
  - Dependencias clave instaladas
  - Conexion con la base de datos
"""

import importlib
import sys
from pathlib import Path


def _ok(msg):
    print(f"  [OK] {msg}")


def _fail(msg):
    print(f"  [FAIL] {msg}")


def main() -> int:
    errors = 0

    print("== Python ==")
    if sys.version_info < (3, 10):
        _fail(f"Python {sys.version.split()[0]} -- se requiere 3.10+")
        errors += 1
    else:
        _ok(f"Python {sys.version.split()[0]}")

    print("\n== .env ==")
    repo_root = Path(__file__).resolve().parent.parent
    env_file = repo_root / ".env"
    if env_file.exists():
        _ok(f".env encontrado en {env_file}")
    else:
        _fail(f"No existe {env_file}. Copialo desde .env.example")
        errors += 1

    print("\n== Dependencias ==")
    required = [
        "fastapi", "uvicorn", "sqlalchemy", "alembic",
        "passlib", "jose", "dotenv", "pydantic", "psycopg2",
    ]
    for module in required:
        try:
            importlib.import_module(module)
            _ok(module)
        except ImportError:
            _fail(f"falta '{module}' (pip install -r backend/requirements.txt)")
            errors += 1

    print("\n== Configuracion ==")
    sys.path.insert(0, str(repo_root / "backend"))
    try:
        from app.core.config import settings  # type: ignore
        _ok(f"DATABASE_URL = {settings.DATABASE_URL.split('@')[-1] if '@' in settings.DATABASE_URL else settings.DATABASE_URL}")
        _ok(f"CORS_ORIGINS = {settings.CORS_ORIGINS}")
        _ok(f"ENVIRONMENT  = {settings.ENVIRONMENT}")
    except Exception as exc:
        _fail(f"No se pudo cargar app.core.config: {exc}")
        errors += 1
        return 1

    print("\n== Conexion a la base de datos ==")
    try:
        from sqlalchemy import create_engine, text  # type: ignore

        engine = create_engine(settings.DATABASE_URL)
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        _ok("Conexion exitosa")
    except Exception as exc:
        _fail(f"No se pudo conectar a la BD: {exc}")
        errors += 1

    print()
    if errors:
        print(f"Se encontraron {errors} problemas. Revisa los detalles arriba.")
        return 1
    print("Entorno OK. Puedes iniciar el backend con uvicorn.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
