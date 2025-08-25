"""create spot_notes table"""

from alembic import op
import sqlalchemy as sa

# Revision identifiers, used by Alembic.
revision = "20250824_230300"      # keep whatever id this file currently has; ok to leave as-is
down_revision = "5c695a566191"    # <-- your previous head
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "spot_notes",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "spot_id",
            sa.Integer(),
            sa.ForeignKey("spots.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("body", sa.Text(), nullable=False),
    )


def downgrade():
    op.drop_table("spot_notes")
