import os
import shutil
from uuid import UUID
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.usuario import Usuario
from app.models.documento import Documento
from app.schemas.documento_schema import DocumentoCreate, DocumentoResponse
from app.services.documento_service import crear_documento, obtener_documentos_proyecto

router = APIRouter(prefix="/documentos", tags=["Documentos"])

UPLOADS_DIR = Path("uploads")
UPLOADS_DIR.mkdir(exist_ok=True)

ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx", ".xls", ".xlsx", ".png", ".jpg", ".jpeg", ".txt", ".zip"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


@router.post("/", response_model=DocumentoResponse)
def crear_doc(
    data: DocumentoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("Admin")),
):
    return crear_documento(
        db,
        titulo=data.titulo,
        descripcion=data.descripcion,
        url=data.url,
        estado=data.estado,
        tipo=data.tipo,
        proyecto_id=data.proyecto_id,
        autor_id=current_user.id,
    )


@router.post("/upload", response_model=DocumentoResponse)
def upload_documento(
    proyecto_id: UUID = Form(...),
    titulo: str = Form(...),
    descripcion: str = Form(""),
    tipo: str = Form("otro"),
    estado: str = Form("borrador"),
    archivo: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("Admin")),
):
    ext = Path(archivo.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Tipo de archivo no permitido: {ext}")

    content = archivo.file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="El archivo supera el límite de 10 MB")

    proyecto_dir = UPLOADS_DIR / str(proyecto_id)
    proyecto_dir.mkdir(exist_ok=True)

    safe_name = f"{UUID(int=__import__('uuid').uuid4().int)}{ext}"
    file_path = proyecto_dir / safe_name

    with open(file_path, "wb") as f:
        f.write(content)

    url = f"/documentos/download/{proyecto_id}/{safe_name}"

    return crear_documento(
        db,
        titulo=titulo,
        descripcion=descripcion,
        url=url,
        estado=estado,
        tipo=tipo,
        proyecto_id=proyecto_id,
        autor_id=current_user.id,
    )


@router.get("/download/{proyecto_id}/{filename}")
def download_documento(
    proyecto_id: UUID,
    filename: str,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    # Verify the document exists in the DB for this project
    doc = db.query(Documento).filter(
        Documento.proyecto_id == proyecto_id,
        Documento.url.contains(filename),
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Documento no encontrado")

    file_path = UPLOADS_DIR / str(proyecto_id) / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Archivo no encontrado en el servidor")

    return FileResponse(
        path=str(file_path),
        filename=doc.titulo + Path(filename).suffix,
        media_type="application/octet-stream",
    )


@router.delete("/{documento_id}")
def eliminar_documento(
    documento_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("Admin")),
):
    doc = db.query(Documento).filter(Documento.id == documento_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Documento no encontrado")

    # Remove physical file if it's a local upload
    if doc.url.startswith("/documentos/download/"):
        parts = doc.url.split("/")
        if len(parts) >= 5:
            file_path = UPLOADS_DIR / parts[3] / parts[4]
            if file_path.exists():
                file_path.unlink()

    db.delete(doc)
    db.commit()
    return {"message": "Documento eliminado"}


@router.get("/proyecto/{proyecto_id}", response_model=list[DocumentoResponse])
def listar_documentos(
    proyecto_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    return obtener_documentos_proyecto(db, proyecto_id)
