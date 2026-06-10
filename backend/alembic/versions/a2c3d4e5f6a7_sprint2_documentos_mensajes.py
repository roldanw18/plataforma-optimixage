"""sprint2 documentos y mensajes

Revision ID: a2c3d4e5f6a7
Revises: 1bf0849f205c
Create Date: 2026-03-31 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = 'a2c3d4e5f6a7'
down_revision: Union[str, Sequence[str], None] = '1bf0849f205c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'documentos',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('titulo', sa.String(), nullable=False),
        sa.Column('descripcion', sa.String(), nullable=True),
        sa.Column('url', sa.String(), nullable=False),
        sa.Column('estado', sa.String(), nullable=False, server_default='borrador'),
        sa.Column('fecha_creacion', sa.DateTime(timezone=True), nullable=True),
        sa.Column('proyecto_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('proyectos.id'), nullable=False),
        sa.Column('autor_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('usuarios.id'), nullable=False),
    )
    op.create_table(
        'mensajes',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('contenido', sa.String(), nullable=False),
        sa.Column('fecha_envio', sa.DateTime(timezone=True), nullable=True),
        sa.Column('proyecto_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('proyectos.id'), nullable=False),
        sa.Column('remitente_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('usuarios.id'), nullable=False),
    )


def downgrade() -> None:
    op.drop_table('mensajes')
    op.drop_table('documentos')
