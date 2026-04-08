from uuid import UUID
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

ETAPAS = ['primer_contacto', 'diagnostico', 'capacitacion', 'desarrollo', 'entrega']

ETAPA_LABELS = {
    'primer_contacto': 'Primer contacto',
    'diagnostico': 'Diagnóstico',
    'capacitacion': 'Capacitación',
    'desarrollo': 'Desarrollo',
    'entrega': 'Entrega',
}


class CambiarEtapaRequest(BaseModel):
    etapa: str
    notas: Optional[str] = None


class EtapaHistorialResponse(BaseModel):
    id: UUID
    proyecto_id: UUID
    etapa: str
    etapa_label: str = ''
    fecha_inicio: datetime
    fecha_fin: Optional[datetime]
    cambiado_por: Optional[UUID]
    notas: Optional[str]

    model_config = ConfigDict(from_attributes=True)

    @classmethod
    def from_orm_with_label(cls, obj):
        data = cls.model_validate(obj)
        data.etapa_label = ETAPA_LABELS.get(obj.etapa, obj.etapa)
        return data


class ProcesoResponse(BaseModel):
    proyecto_id: UUID
    etapa_actual: str
    etapa_label: str
    progreso: int          # 0-100
    etapas: list[dict]     # lista de {key, label, estado: completado|activo|pendiente}
    historial: list[EtapaHistorialResponse]
