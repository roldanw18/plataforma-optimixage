from uuid import UUID
from sqlalchemy.orm import Session
from app.models.documento import Documento
from app.models.usuario import Usuario
from app.models.proyecto import Proyecto
from app.models.proyecto_miembro import ProyectoMiembro
from app.services.notificaciones_service import crear_para_muchos


def _destinatarios_proyecto(db: Session, proyecto_id: UUID, excluir: UUID) -> list[UUID]:
    ids: set[UUID] = set()
    proyecto = db.query(Proyecto).filter(Proyecto.id == proyecto_id).first()
    if proyecto and proyecto.cliente_id:
        ids.add(proyecto.cliente_id)
    miembros = (
        db.query(ProyectoMiembro.usuario_id)
        .filter(ProyectoMiembro.proyecto_id == proyecto_id)
        .all()
    )
    for (uid,) in miembros:
        ids.add(uid)
    ids.discard(excluir)
    return list(ids)


def crear_documento(db: Session, titulo: str, descripcion: str, url: str,
                    estado: str, proyecto_id: UUID, autor_id: UUID,
                    tipo: str = "otro") -> Documento:
    documento = Documento(
        titulo=titulo,
        descripcion=descripcion,
        url=url,
        estado=estado,
        tipo=tipo,
        proyecto_id=proyecto_id,
        autor_id=autor_id,
    )
    db.add(documento)
    db.commit()
    db.refresh(documento)

    # Solo notificar si el documento está publicado (no borradores)
    if estado == "publicado":
        destinatarios = _destinatarios_proyecto(db, proyecto_id, excluir=autor_id)
        if destinatarios:
            autor = db.query(Usuario).filter(Usuario.id == autor_id).first()
            nombre_autor = autor.nombre if autor else "Alguien"
            crear_para_muchos(
                db,
                usuario_ids=destinatarios,
                tipo="documento_subido",
                titulo=f"Nuevo documento: {titulo}",
                contenido=f"{nombre_autor} subió un documento al proyecto",
                referencia_id=documento.id,
                referencia_tipo="documento",
            )

    return documento


def obtener_documentos_proyecto(db: Session, proyecto_id: UUID) -> list[Documento]:
    return db.query(Documento).filter(Documento.proyecto_id == proyecto_id).all()
