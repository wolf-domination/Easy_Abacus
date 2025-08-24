"""create spots table

Revision ID: 9cb4716d2d82
Revises: ffdc0a98111c
Create Date: 2025-08-22 17:45:56.577722
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "9cb4716d2d82"
down_revision = "ffdc0a98111c"
branch_labels = None
depends_on = None


def upgrade():
    """
    Creates the 'spots' table.

    Columns:
      - id: primary key
      - name: unique, required
      - description: optional text
      - created_at: defaults to current timestamp (DB-level)
      - updated_at: defaults to current timestamp (DB-level)

    Notes:
    - server_default=sa.text("CURRENT_TIMESTAMP") works on SQLite and Postgres.
    - If you want updated_at to auto-update on UPDATE statements at the DB level,
      that typically needs a trigger (differs by DB). Most apps update it in app code.
    """
    op.create_table(
        "spots",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=255), nullable=False, unique=True),
        sa.Column("description", sa.Text()),
        sa.Column(
            "created_at",
            sa.DateTime(),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
    )


def downgrade():
    """Drops the 'spots' table."""
    op.drop_table("spots")
