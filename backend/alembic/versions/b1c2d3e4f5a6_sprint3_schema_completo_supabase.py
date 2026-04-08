"""sprint3 schema completo supabase

Revision ID: b1c2d3e4f5a6
Revises: a2c3d4e5f6a7
Create Date: 2026-04-08 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = 'b1c2d3e4f5a6'
down_revision: Union[str, Sequence[str], None] = 'a2c3d4e5f6a7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # --- Columnas nuevas en usuarios ---
    op.add_column('usuarios', sa.Column('telefono', sa.String(), nullable=True))
    op.add_column('usuarios', sa.Column('avatar_url', sa.String(), nullable=True))
    op.add_column('usuarios', sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'))
    op.add_column('usuarios', sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()))
    op.add_column('usuarios', sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()))

    # --- Columnas nuevas en proyectos ---
    op.add_column('proyectos', sa.Column('descripcion', sa.String(), nullable=True))
    op.add_column('proyectos', sa.Column('estado', sa.String(), nullable=False, server_default='activo'))
    op.add_column('proyectos', sa.Column('fecha_inicio', sa.Date(), nullable=True))
    op.add_column('proyectos', sa.Column('fecha_fin', sa.Date(), nullable=True))
    op.add_column('proyectos', sa.Column('created_by', postgresql.UUID(as_uuid=True), sa.ForeignKey('usuarios.id'), nullable=True))
    op.add_column('proyectos', sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()))
    op.add_column('proyectos', sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()))

    # --- Columnas nuevas en documentos ---
    op.add_column('documentos', sa.Column('tipo', sa.String(), nullable=True, server_default='otro'))
    op.add_column('documentos', sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()))

    # --- Columnas nuevas en mensajes ---
    op.add_column('mensajes', sa.Column('leido', sa.Boolean(), nullable=False, server_default='false'))

    # --- Nueva tabla: proyecto_miembros ---
    op.create_table(
        'proyecto_miembros',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('proyecto_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('proyectos.id', ondelete='CASCADE'), nullable=False),
        sa.Column('usuario_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('usuarios.id', ondelete='CASCADE'), nullable=False),
        sa.Column('rol_en_proyecto', sa.String(), nullable=False, server_default='miembro'),
        sa.Column('joined_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint('proyecto_id', 'usuario_id', name='uq_proyecto_miembro'),
    )

    # --- Nueva tabla: hitos ---
    op.create_table(
        'hitos',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('nombre', sa.String(), nullable=False),
        sa.Column('descripcion', sa.String(), nullable=True),
        sa.Column('proyecto_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('proyectos.id', ondelete='CASCADE'), nullable=False),
        sa.Column('fecha_limite', sa.Date(), nullable=True),
        sa.Column('estado', sa.String(), nullable=False, server_default='pendiente'),
        sa.Column('orden', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    # --- Nueva tabla: tareas ---
    op.create_table(
        'tareas',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('titulo', sa.String(), nullable=False),
        sa.Column('descripcion', sa.String(), nullable=True),
        sa.Column('estado', sa.String(), nullable=False, server_default='pendiente'),
        sa.Column('prioridad', sa.String(), nullable=False, server_default='media'),
        sa.Column('proyecto_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('proyectos.id', ondelete='CASCADE'), nullable=False),
        sa.Column('hito_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('hitos.id', ondelete='SET NULL'), nullable=True),
        sa.Column('asignado_a', postgresql.UUID(as_uuid=True), sa.ForeignKey('usuarios.id', ondelete='SET NULL'), nullable=True),
        sa.Column('creado_por', postgresql.UUID(as_uuid=True), sa.ForeignKey('usuarios.id', ondelete='SET NULL'), nullable=True),
        sa.Column('fecha_limite', sa.Date(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    # --- Nueva tabla: reuniones ---
    op.create_table(
        'reuniones',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('titulo', sa.String(), nullable=False),
        sa.Column('descripcion', sa.String(), nullable=True),
        sa.Column('fecha', sa.DateTime(timezone=True), nullable=False),
        sa.Column('duracion_minutos', sa.Integer(), nullable=True),
        sa.Column('enlace', sa.String(), nullable=True),
        sa.Column('proyecto_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('proyectos.id', ondelete='CASCADE'), nullable=False),
        sa.Column('creado_por', postgresql.UUID(as_uuid=True), sa.ForeignKey('usuarios.id'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    # --- Nueva tabla: notificaciones ---
    op.create_table(
        'notificaciones',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('usuario_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('usuarios.id', ondelete='CASCADE'), nullable=False),
        sa.Column('tipo', sa.String(), nullable=False),
        sa.Column('titulo', sa.String(), nullable=False),
        sa.Column('contenido', sa.String(), nullable=True),
        sa.Column('leida', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('referencia_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('referencia_tipo', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table('notificaciones')
    op.drop_table('reuniones')
    op.drop_table('tareas')
    op.drop_table('hitos')
    op.drop_table('proyecto_miembros')

    op.drop_column('mensajes', 'leido')
    op.drop_column('documentos', 'updated_at')
    op.drop_column('documentos', 'tipo')
    op.drop_column('proyectos', 'updated_at')
    op.drop_column('proyectos', 'created_at')
    op.drop_column('proyectos', 'created_by')
    op.drop_column('proyectos', 'fecha_fin')
    op.drop_column('proyectos', 'fecha_inicio')
    op.drop_column('proyectos', 'estado')
    op.drop_column('proyectos', 'descripcion')
    op.drop_column('usuarios', 'updated_at')
    op.drop_column('usuarios', 'created_at')
    op.drop_column('usuarios', 'is_active')
    op.drop_column('usuarios', 'avatar_url')
    op.drop_column('usuarios', 'telefono')
