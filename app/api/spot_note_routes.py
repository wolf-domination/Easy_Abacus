from flask import Blueprint, request
from app.models import db, Spot, SpotNote

spot_note_routes = Blueprint("spot_notes", __name__, url_prefix="/api")

@spot_note_routes.get("/spots/<int:spot_id>/notes")
def list_notes(spot_id):
    Spot.query.get_or_404(spot_id)
    notes = SpotNote.query.filter_by(spot_id=spot_id).order_by(SpotNote.created_at.desc()).all()
    return {"notes": [n.to_dict() for n in notes]}

@spot_note_routes.post("/spots/<int:spot_id>/notes")
def create_note(spot_id):
    Spot.query.get_or_404(spot_id)
    data = request.get_json(silent=True) or {}
    body = (data.get("body") or "").strip()
    if not body:
        return {"errors": {"body": "Note cannot be empty"}}, 400
    n = SpotNote(spot_id=spot_id, body=body)
    db.session.add(n)
    db.session.commit()
    return n.to_dict(), 201

@spot_note_routes.delete("/notes/<int:note_id>")
def delete_note(note_id):
    n = SpotNote.query.get_or_404(note_id)
    db.session.delete(n)
    db.session.commit()
    return {"status": "ok"}
