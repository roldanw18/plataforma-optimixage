from uuid import UUID
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.proyecto import Proyecto
from app.models.usuario import Usuario
from app.models.etapa_historial import EtapaHistorial
from app.models.notificacion import Notificacion
from app.schemas.proceso_schema import (
    CambiarEtapaRequest,
    EtapaHistorialResponse,
    ProcesoResponse,
    ETAPAS,
    ETAPA_LABELS,
)
from app.utils.audit import registrar_evento

router = APIRouter(prefix="/proceso", tags=["Proceso"])


def _calcular_proceso(proyecto: Proyecto, historial: list) -> ProcesoResponse:
    etapa_actual = proyecto.etapa_actual or "primer_contacto"
    idx_actual = ETAPAS.index(etapa_actual) if etapa_actual in ETAPAS else 0
    progreso = round((idx_actual + 1) / len(ETAPAS) * 100)

    etapas_detalle = []
    for i, key in enumerate(ETAPAS):
        if i < idx_actual:
            estado = "completado"
        elif i == idx_actual:
            estado = "activo"
        else:
            estado = "pendiente"
        etapas_detalle.append({"key": key, "label": ETAPA_LABELS[key], "estado": estado})

    return ProcesoResponse(
        proyecto_id=proyecto.id,
        etapa_actual=etapa_actual,
        etapa_label=ETAPA_LABELS.get(etapa_actual, etapa_actual),
        progreso=progreso,
        etapas=etapas_detalle,
        historial=[EtapaHistorialResponse.model_validate(h) for h in historial],
    )


@router.get("/{proyecto_id}", response_model=ProcesoResponse)
def obtener_proceso(
    proyecto_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    proyecto = db.query(Proyecto).filter(Proyecto.id == proyecto_id).first()
    if not proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")

    # Los clientes solo ven su propio proyecto
    if current_user.rol.nombre != "Admin" and proyecto.cliente_id != current_user.id:
        raise HTTPException(status_code=403, detail="Sin acceso a este proyecto")

    historial = (
        db.query(EtapaHistorial)
        .filter(EtapaHistorial.proyecto_id == proyecto_id)
        .order_by(EtapaHistorial.fecha_inicio.desc())
        .all()
    )
    return _calcular_proceso(proyecto, historial)


@router.post("/{proyecto_id}/cambiar-etapa", response_model=ProcesoResponse)
def cambiar_etapa(
    proyecto_id: UUID,
    data: CambiarEtapaRequest,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("Admin")),
):
    if data.etapa not in ETAPAS:
        raise HTTPException(
            status_code=422,
            detail=f"Etapa inválida. Valores válidos: {ETAPAS}",
        )

    proyecto = db.query(Proyecto).filter(Proyecto.id == proyecto_id).first()
    if not proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")

    etapa_anterior = proyecto.etapa_actual

    # Cerrar registro activo en el historial
    historial_activo = (
        db.query(EtapaHistorial)
        .filter(
            EtapaHistorial.proyecto_id == proyecto_id,
            EtapaHistorial.fecha_fin == None,  # noqa: E711
        )
        .first()
    )
    if historial_activo:
        historial_activo.fecha_fin = datetime.now(timezone.utc)

    # Actualizar etapa del proyecto
    proyecto.etapa_actual = data.etapa

    # Crear nuevo registro en historial
    nuevo_historial = EtapaHistorial(
        proyecto_id=proyecto_id,
        etapa=data.etapa,
        cambiado_por=current_user.id,
        notas=data.notas,
    )
    db.add(nuevo_historial)

    # Audit log
    registrar_evento(
        db,
        accion="cambiar_etapa",
        usuario_id=current_user.id,
        tabla="proyectos",
        registro_id=proyecto_id,
        detalle_anterior={"etapa_actual": etapa_anterior},
        detalle_nuevo={"etapa_actual": data.etapa, "notas": data.notas},
    )

    # Notificación automática al cliente del proyecto
    if proyecto.cliente_id:
        etapa_label = ETAPA_LABELS.get(data.etapa, data.etapa)
        notificacion = Notificacion(
            usuario_id=proyecto.cliente_id,
            tipo="proyecto_actualizado",
            titulo=f"Tu proyecto avanzó a: {etapa_label}",
            contenido=(
                data.notas
                or f"El administrador actualizó la etapa de '{proyecto.nombre}' a {etapa_label}."
            ),
            referencia_id=proyecto.id,
            referencia_tipo="proyecto",
        )
        db.add(notificacion)

    db.commit()
    db.refresh(proyecto)

    historial = (
        db.query(EtapaHistorial)
        .filter(EtapaHistorial.proyecto_id == proyecto_id)
        .order_by(EtapaHistorial.fecha_inicio.desc())
        .all()
    )
    return _calcular_proceso(proyecto, historial)


@router.get("/{proyecto_id}/historial", response_model=list[EtapaHistorialResponse])
def obtener_historial(
    proyecto_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    proyecto = db.query(Proyecto).filter(Proyecto.id == proyecto_id).first()
    if not proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")

    if current_user.rol.nombre != "Admin" and proyecto.cliente_id != current_user.id:
        raise HTTPException(status_code=403, detail="Sin acceso a este proyecto")

    return (
        db.query(EtapaHistorial)
        .filter(EtapaHistorial.proyecto_id == proyecto_id)
        .order_by(EtapaHistorial.fecha_inicio.desc())
        .all()
    )
