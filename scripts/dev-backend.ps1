# Inicia el backend con uvicorn en modo desarrollo (--reload)
$ErrorActionPreference = "Stop"
.\venv\Scripts\Activate.ps1
Push-Location backend
try {
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
} finally {
    Pop-Location
}
