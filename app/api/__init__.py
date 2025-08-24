


from flask import Blueprint, request
from app.models import db, Spot

spot_routes = Blueprint("spots", __name__)

@spot_routes.get("")
def index():
    spots = Spot.query.order_by(Spot.updated_at.desc()).all()
    return {"spots": [s.to_dict() for s in spots]}

@spot_routes.post("")
def create():
    data = request.get_json() or {}
    name = (data.get("name") or "").strip()
    description = (data.get("description") or "").strip()
    if not name:
        return {"errors": {"name": "Name is required"}}, 400

    s = Spot(name=name, description=description)
    db.session.add(s)
    db.session.commit()
    return s.to_dict(), 201

@spot_routes.get("/<int:spot_id>")
def show(spot_id):
    s = Spot.query.get_or_404(spot_id)
    return s.to_dict()

@spot_routes.delete("/<int:spot_id>")
def destroy(spot_id):
    s = Spot.query.get_or_404(spot_id)
    db.session.delete(s)
    db.session.commit()
    return {"status": "ok"}