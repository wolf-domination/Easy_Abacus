from flask import Blueprint, request
from app.models import db, Spot, SpotNote

spot_routes = Blueprint("spots", __name__, url_prefix="/api/spots")


@spot_routes.get("")
def index():
    spots = Spot.query.order_by(Spot.updated_at.desc()).all()
    return {"spots": [s.to_dict() for s in spots]}


@spot_routes.post("")
def create():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    description = (data.get("description") or "").strip()
    if not name:
        return {"errors": {"name": "Name is required"}}, 400

    s = Spot(name=name, description=description)
    db.session.add(s)
    db.session.commit()
    return s.to_dict(), 201


@spot_routes.get("/<int:spot_id>")
def show(spot_id: int):
    s = Spot.query.get_or_404(spot_id)
    return s.to_dict()


@spot_routes.delete("/<int:spot_id>")
def destroy(spot_id: int):
    s = Spot.query.get_or_404(spot_id)
    db.session.delete(s)
    db.session.commit()
    return {"status": "ok"}


# ---------- thumbnails ----------
@spot_routes.post("/<int:spot_id>/thumbnail")
def upload_thumbnail(spot_id: int):
    s = Spot.query.get_or_404(spot_id)
    file = request.files.get("file")
    if not file:
        return {"errors": {"file": "Image file is required"}}, 400

    # save locally under /uploads (already ensured in your Flask app config)
    from pathlib import Path
    uploads = Path("uploads")
    uploads.mkdir(parents=True, exist_ok=True)
    dest = uploads / file.filename
    file.save(dest)

    s.thumbnail_url = f"/uploads/{dest.name}"
    db.session.commit()
    return s.to_dict()


# ---------- notes ----------
@spot_routes.get("/<int:spot_id>/notes")
def list_notes(spot_id: int):
    Spot.query.get_or_404(spot_id)
    notes = SpotNote.query.filter_by(spot_id=spot_id).order_by(SpotNote.created_at.asc()).all()
    return {"notes": [n.to_dict() for n in notes]}


@spot_routes.post("/<int:spot_id>/notes")
def create_note(spot_id: int):
    Spot.query.get_or_404(spot_id)
    data = request.get_json(silent=True) or {}
    body = (data.get("body") or "").strip()
    if not body:
        return {"errors": {"body": "Note body is required"}}, 400
    n = SpotNote(spot_id=spot_id, body=body)
    db.session.add(n)
    db.session.commit()
    return n.to_dict(), 201


@spot_routes.delete("/<int:spot_id>/notes/<int:note_id>")
def delete_note(spot_id: int, note_id: int):
    n = SpotNote.query.filter_by(id=note_id, spot_id=spot_id).first_or_404()
    db.session.delete(n)
    db.session.commit()
    return {"status": "ok"}
