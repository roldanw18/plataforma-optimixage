"""sprint2 proceso core - etapa_actual + historial + audit_log

Revision ID: c2d3e4f5a6b7
Revises: b1c2d3e4f5a6
Create Date: 2026-04-08 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = 'c2d3e4f5a6b7'
down_revision: Union[str, Sequence[str], None] = 'b1c2d3e4f5a6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # etapa_actual en proyectos
    op.add_column('proyectos', sa.Column(
        'etapa_actual', sa.String(), nullable=False, server_default='primer_contacto'
    ))

    # Historial de etapas
    op.create_table(
        'proyecto_etapa_historial',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('proyecto_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('proyectos.id', ondelete='CASCADE'), nullable=False),
        sa.Column('etapa', sa.String(), nullable=False),
        sa.Column('fecha_inicio', sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.func.now()),
        sa.Column('fecha_fin', sa.DateTime(timezone=True), nullable=True),
        sa.Column('cambiado_por', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('usuarios.id', ondelete='SET NULL'), nullable=True),
        sa.Column('notas', sa.Text(), nullable=True),
    )
    op.create_index('idx_etapa_historial_proyecto', 'proyecto_etapa_historial', ['proyecto_id'])

    # Audit log
    op.create_table(
        'audit_log',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('usuario_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('usuarios.id', ondelete='SET NULL'), nullable=True),
        sa.Column('accion', sa.String(), nullable=False),
        sa.Column('tabla', sa.String(), nullable=True),
        sa.Column('registro_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('detalle_anterior', postgresql.JSONB(), nullable=True),
        sa.Column('detalle_nuevo', postgresql.JSONB(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.func.now()),
    )
    op.create_index('idx_audit_log_usuario', 'audit_log', ['usuario_id'])
    op.create_index('idx_audit_log_tabla_registro', 'audit_log', ['tabla', 'registro_id'])


def downgrade() -> None:
    op.drop_table('audit_log')
    op.drop_table('proyecto_etapa_historial')
    op.drop_column('proyectos', 'etapa_actual')
