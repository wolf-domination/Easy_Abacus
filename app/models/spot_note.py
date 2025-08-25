from datetime import datetime
from .db import db


class SpotNote(db.Model):
    __tablename__ = "spot_notes"

    id = db.Column(db.Integer, primary_key=True)
    spot_id = db.Column(db.Integer, db.ForeignKey("spots.id"), nullable=False, index=True)
    body = db.Column(db.Text, nullable=False, default="")
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    spot = db.relationship("Spot", back_populates="notes")

    def to_dict(self):
        return {
            "id": self.id,
            "spot_id": self.spot_id,
            "body": self.body,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
