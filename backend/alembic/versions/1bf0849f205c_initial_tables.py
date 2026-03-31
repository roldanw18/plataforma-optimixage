"""initial tables

Revision ID: 1bf0849f205c
Revises: 
Create Date: 2026-03-16 22:29:48.064201

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1bf0849f205c'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'roles',
        sa.Column('id', sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('nombre', sa.String(), nullable=False, unique=True),
    )
    op.create_table(
        'usuarios',
        sa.Column('id', sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('nombre', sa.String(), nullable=False),
        sa.Column('email', sa.String(), nullable=False, unique=True, index=True),
        sa.Column('password_hash', sa.String(), nullable=False),
        sa.Column('rol_id', sa.dialects.postgresql.UUID(as_uuid=True), sa.ForeignKey('roles.id'), nullable=True),
    )
    op.create_table(
        'proyectos',
        sa.Column('id', sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('nombre', sa.String(), nullable=False),
        sa.Column('cliente_id', sa.dialects.postgresql.UUID(as_uuid=True), sa.ForeignKey('usuarios.id'), nullable=True),
    )


def downgrade() -> None:
    op.drop_table('proyectos')
    op.drop_table('usuarios')
    op.drop_table('roles')
