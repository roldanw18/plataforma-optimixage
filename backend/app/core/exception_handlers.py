from fastapi import Request
from fastapi.responses import JSONResponse
from datetime import datetime
import logging

logger = logging.getLogger("app")


async def global_exception_handler(request: Request, exc: Exception):

    logger.error(f"Error inesperado: {exc}")

    return JSONResponse(
        status_code=500,
        content={
            "error": "internal_server_error",
            "message": "Ocurrió un error inesperado en el sistema",
            "timestamp": datetime.utcnow().isoformat()
        }
    )