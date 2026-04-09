from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.usuario import Usuario
from app.schemas.mensaje_schema import MensajeCreate, MensajeResponse
from app.services.mensaje_service import enviar_mensaje, obtener_mensajes_proyecto

router = APIRouter(prefix="/mensajes", tags=["Mensajes"])


@router.post("/", response_model=MensajeResponse)
def enviar(
    data: MensajeCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    return enviar_mensaje(db, contenido=data.contenido,
                          proyecto_id=data.proyecto_id,
                          remitente_id=current_user.id)


@router.get("/proyecto/{proyecto_id}", response_model=list[MensajeResponse])
def listar_mensajes(
    proyecto_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    return obtener_mensajes_proyecto(db, proyecto_id)
