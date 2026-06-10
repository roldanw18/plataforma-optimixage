import uuid as _uuid_mod
from uuid import UUID
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.usuario import Usuario
from app.models.contenido import Contenido
from app.schemas.contenido_schema import ContenidoResponse, ContenidoUpdate

router = APIRouter(prefix="/contenidos", tags=["Contenidos"])

UPLOADS_DIR = Path("uploads")
CONTENIDOS_DIR = UPLOADS_DIR / "contenidos"
CONTENIDOS_DIR.mkdir(parents=True, exist_ok=True)

IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"}
VIDEO_EXTS = {".mp4", ".webm", ".ogg", ".mov", ".avi", ".mkv"}
MAX_IMAGE_SIZE = 10 * 1024 * 1024   # 10 MB
MAX_VIDEO_SIZE = 200 * 1024 * 1024  # 200 MB


@router.post("/upload", response_model=ContenidoResponse)
def subir_contenido(
    titulo: str = Form(...),
    descripcion: str = Form(""),
    tipo: str = Form(...),  # imagen | video
    cliente_id: str = Form(""),  # vacío = global
    archivo: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("Admin")),
):
    if tipo not in {"imagen", "video"}:
        raise HTTPException(status_code=400, detail="Tipo inválido (imagen|video)")

    ext = Path(archivo.filename or "").suffix.lower()
    allowed = IMAGE_EXTS if tipo == "imagen" else VIDEO_EXTS
    if ext not in allowed:
        raise HTTPException(status_code=400, detail=f"Extensión {ext} no permitida para {tipo}")

    content = archivo.file.read()
    max_size = MAX_IMAGE_SIZE if tipo == "imagen" else MAX_VIDEO_SIZE
    if len(content) > max_size:
        mb = max_size // (1024 * 1024)
        raise HTTPException(status_code=400, detail=f"El archivo supera el límite de {mb} MB")

    safe_name = f"{_uuid_mod.uuid4()}{ext}"
    file_path = CONTENIDOS_DIR / safe_name
    with open(file_path, "wb") as f:
        f.write(content)

    url = f"/contenidos/file/{safe_name}"

    parsed_cliente_id = None
    if cliente_id.strip():
        try:
            parsed_cliente_id = _uuid_mod.UUID(cliente_id.strip())
        except ValueError:
            pass

    contenido = Contenido(
        titulo=titulo.strip(),
        descripcion=(descripcion or "").strip() or None,
        tipo=tipo,
        url=url,
        creado_por=current_user.id,
        cliente_id=parsed_cliente_id,
    )
    db.add(contenido)
    db.commit()
    db.refresh(contenido)
    return contenido


@router.get("/", response_model=list[ContenidoResponse])
def listar_contenidos(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    # Admin ve todo; cliente ve global (cliente_id IS NULL) + su contenido personal
    if current_user.rol and current_user.rol.nombre == "Admin":
        return db.query(Contenido).order_by(Contenido.created_at.desc()).all()
    return (
        db.query(Contenido)
        .filter(or_(Contenido.cliente_id.is_(None), Contenido.cliente_id == current_user.id))
        .order_by(Contenido.created_at.desc())
        .all()
    )


@router.get("/file/{filename}")
def servir_archivo(filename: str):
    file_path = (CONTENIDOS_DIR / filename).resolve()
    allowed_root = CONTENIDOS_DIR.resolve()
    if not str(file_path).startswith(str(allowed_root)):
        raise HTTPException(status_code=400, detail="Ruta inválida")
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    return FileResponse(path=str(file_path))


@router.patch("/{contenido_id}", response_model=ContenidoResponse)
def actualizar_contenido(
    contenido_id: UUID,
    data: ContenidoUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("Admin")),
):
    contenido = db.query(Contenido).filter(Contenido.id == contenido_id).first()
    if not contenido:
        raise HTTPException(status_code=404, detail="Contenido no encontrado")

    for field, value in data.model_dump(exclude_none=True).items():
        setattr(contenido, field, value)

    db.commit()
    db.refresh(contenido)
    return contenido


@router.delete("/{contenido_id}", status_code=204)
def eliminar_contenido(
    contenido_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("Admin")),
):
    contenido = db.query(Contenido).filter(Contenido.id == contenido_id).first()
    if not contenido:
        raise HTTPException(status_code=404, detail="Contenido no encontrado")

    if contenido.url.startswith("/contenidos/file/"):
        filename = contenido.url.rsplit("/", 1)[-1]
        file_path = CONTENIDOS_DIR / filename
        if file_path.exists():
            try:
                file_path.unlink()
            except OSError:
                pass

    db.delete(contenido)
    db.commit()
