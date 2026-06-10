# =============================================================================
# Optimixage - Setup automatizado (Windows / PowerShell)
# Uso: .\scripts\setup.ps1
# =============================================================================
$ErrorActionPreference = "Stop"

Write-Host "==> Verificando versiones..." -ForegroundColor Cyan
$pythonVersion = (python --version) 2>&1
$nodeVersion   = (node --version) 2>&1
$npmVersion    = (npm --version) 2>&1

Write-Host "Python: $pythonVersion"
Write-Host "Node:   $nodeVersion"
Write-Host "npm:    $npmVersion"

if ($pythonVersion -notmatch "Python 3\.(1[0-9]|[2-9][0-9])") {
    Write-Host "ERROR: se requiere Python 3.10 o superior." -ForegroundColor Red
    exit 1
}

# --- .env raiz -------------------------------------------------------------
if (-not (Test-Path ".env")) {
    Write-Host "==> Creando .env desde .env.example" -ForegroundColor Cyan
    Copy-Item ".env.example" ".env"
    Write-Host "    Recuerda revisar credenciales en .env"
} else {
    Write-Host "==> .env ya existe (no se sobrescribe)"
}

# --- Backend ---------------------------------------------------------------
Write-Host "==> Creando virtualenv backend..." -ForegroundColor Cyan
if (-not (Test-Path ".\venv")) {
    python -m venv venv
}
.\venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r backend\requirements.txt

Write-Host "==> Aplicando migraciones..." -ForegroundColor Cyan
Push-Location backend
try {
    alembic upgrade head
} finally {
    Pop-Location
}

# --- Frontend --------------------------------------------------------------
Write-Host "==> Instalando dependencias frontend..." -ForegroundColor Cyan
if (-not (Test-Path "frontend\.env")) {
    Copy-Item "frontend\.env.example" "frontend\.env"
}
Push-Location frontend
try {
    npm install
} finally {
    Pop-Location
}

Write-Host ""
Write-Host "Listo. Para iniciar:" -ForegroundColor Green
Write-Host "  Backend:  .\scripts\dev-backend.ps1"
Write-Host "  Frontend: .\scripts\dev-frontend.ps1"
