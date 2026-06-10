# Inicia el frontend (Vite dev server)
$ErrorActionPreference = "Stop"
Push-Location frontend
try {
    npm run dev
} finally {
    Pop-Location
}
