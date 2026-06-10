"""
Configuracion centralizada de la aplicacion.

Carga las variables de entorno desde el archivo .env de la raiz del repositorio
y las expone como atributos de `settings`. Si python-dotenv no esta instalado,
la carga es silenciosa y se confia unicamente en las variables del sistema.
"""

import os
from pathlib import Path

try:
    from dotenv import load_dotenv

    # Buscar .env subiendo desde este archivo hasta la raiz del repo
    _here = Path(__file__).resolve()
    for _parent in _here.parents:
        _candidate = _parent / ".env"
        if _candidate.exists():
            load_dotenv(_candidate, override=False)
            break
except ImportError:  # pragma: no cover - dotenv es opcional
    pass


def _split_csv(value: str) -> list[str]:
    return [item.strip() for item in value.split(",") if item.strip()]


class Settings:
    PROJECT_NAME: str = "Plataforma Seguimiento Optimixage"
    VERSION: str = "3.0.0"

    # --- Base de datos ---
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:///./optimixage.db",
    )

    # --- Seguridad / JWT ---
    SECRET_KEY: str = os.getenv("SECRET_KEY", "change-me-in-development-only")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

    # --- CORS ---
    # Lista separada por comas. Por defecto incluye los puertos comunes del
    # dev server de Vite y el contenedor de produccion frontend.
    CORS_ORIGINS: list[str] = _split_csv(
        os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000",
        )
    )

    # --- Bootstrap admin (solo se aplica si la base de datos esta vacia) ---
    BOOTSTRAP_ADMIN_EMAIL: str = os.getenv("BOOTSTRAP_ADMIN_EMAIL", "admin@optimixage.local")
    BOOTSTRAP_ADMIN_PASSWORD: str = os.getenv("BOOTSTRAP_ADMIN_PASSWORD", "Admin1234!")
    BOOTSTRAP_ADMIN_NOMBRE: str = os.getenv("BOOTSTRAP_ADMIN_NOMBRE", "Administrador")

    # --- Almacenamiento ---
    UPLOADS_DIR: str = os.getenv("UPLOADS_DIR", "uploads")

    # --- Entorno ---
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() == "production"


settings = Settings()
