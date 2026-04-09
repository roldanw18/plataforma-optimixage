from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.usuario import Usuario
from app.schemas.documento_schema import DocumentoCreate, DocumentoResponse
from app.services.documento_service import crear_documento, obtener_documentos_proyecto

router = APIRouter(prefix="/documentos", tags=["Documentos"])


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
        proyecto_id=data.proyecto_id,
        autor_id=current_user.id,
    )


@router.get("/proyecto/{proyecto_id}", response_model=list[DocumentoResponse])
def listar_documentos(
    proyecto_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    return obtener_documentos_proyecto(db, proyecto_id)
