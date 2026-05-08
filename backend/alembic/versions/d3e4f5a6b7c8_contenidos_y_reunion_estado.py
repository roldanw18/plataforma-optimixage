"""contenidos table and reunion estado/updated_at

Revision ID: d3e4f5a6b7c8
Revises: b1c2d3e4f5a6
Create Date: 2026-05-08 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = 'd3e4f5a6b7c8'
down_revision: Union[str, Sequence[str], None] = 'b1c2d3e4f5a6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'contenidos',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('titulo', sa.String(), nullable=False),
        sa.Column('descripcion', sa.String(), nullable=True),
        sa.Column('tipo', sa.String(), nullable=False, server_default='imagen'),
        sa.Column('url', sa.String(), nullable=False),
        sa.Column('creado_por', postgresql.UUID(as_uuid=True), sa.ForeignKey('usuarios.id', ondelete='SET NULL'), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    op.add_column(
        'reuniones',
        sa.Column('estado', sa.String(), nullable=False, server_default='pendiente'),
    )
    op.add_column(
        'reuniones',
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    op.drop_column('reuniones', 'updated_at')
    op.drop_column('reuniones', 'estado')
    op.drop_table('contenidos')
