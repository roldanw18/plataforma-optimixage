from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog


def registrar_evento(
    db: Session,
    accion: str,
    usuario_id=None,
    tabla: str = None,
    registro_id=None,
    detalle_anterior: dict = None,
    detalle_nuevo: dict = None,
):
    """Registra un evento de auditoría en la base de datos."""
    log = AuditLog(
        usuario_id=usuario_id,
        accion=accion,
        tabla=tabla,
        registro_id=registro_id,
        detalle_anterior=detalle_anterior,
        detalle_nuevo=detalle_nuevo,
    )
    db.add(log)
    # No hacemos commit aquí — el llamador lo maneja junto con su transacción principal
