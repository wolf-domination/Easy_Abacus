from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
import os
from app.models import db, Spot

spot_routes = Blueprint("spots", __name__, url_prefix="/api/spots")

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp", "gif"}

def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

@spot_routes.get("")
def index():
    spots = Spot.query.order_by(Spot.updated_at.desc()).all()
    return {"spots": [s.to_dict() for s in spots]}

# Create supports BOTH JSON and multipart form (optional file)
@spot_routes.post("")
def create():
    if request.content_type and "multipart/form-data" in request.content_type:
        name = (request.form.get("name") or "").strip()
        description = (request.form.get("description") or "").strip()
        file = request.files.get("file")
    else:
        data = request.get_json(silent=True) or {}
        name = (data.get("name") or "").strip()
        description = (data.get("description") or "").strip()
        file = None

    if not name:
        return {"errors": {"name": "Name is required"}}, 400

    s = Spot(name=name, description=description)

    # Optional file upload on create
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        # avoid collisions
        base, ext = os.path.splitext(filename)
        i = 1
        upload_dir = current_app.config["UPLOAD_FOLDER"]
        cand = filename
        while os.path.exists(os.path.join(upload_dir, cand)):
            cand = f"{base}_{i}{ext}"
            i += 1
        path = os.path.join(upload_dir, cand)
        file.save(path)
        s.thumbnail_filename = cand

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
    # delete file from disk if present
    if s.thumbnail_filename:
        try:
            os.remove(os.path.join(current_app.config["UPLOAD_FOLDER"], s.thumbnail_filename))
        except OSError:
            pass
    db.session.delete(s)
    db.session.commit()
    return {"status": "ok"}

# Update/replace thumbnail later
@spot_routes.post("/<int:spot_id>/thumbnail")
def upload_thumbnail(spot_id):
    s = Spot.query.get_or_404(spot_id)
    if "file" not in request.files:
        return {"errors": {"file": "Missing file"}}, 400
    file = request.files["file"]
    if file.filename == "" or not allowed_file(file.filename):
        return {"errors": {"file": "Invalid file"}}, 400

    # delete old file if exists
    if s.thumbnail_filename:
        try:
            os.remove(os.path.join(current_app.config["UPLOAD_FOLDER"], s.thumbnail_filename))
        except OSError:
            pass

    filename = secure_filename(file.filename)
    base, ext = os.path.splitext(filename)
    i = 1
    upload_dir = current_app.config["UPLOAD_FOLDER"]
    cand = filename
    while os.path.exists(os.path.join(upload_dir, cand)):
        cand = f"{base}_{i}{ext}"
        i += 1
    file.save(os.path.join(upload_dir, cand))
    s.thumbnail_filename = cand
    db.session.commit()
    return s.to_dict(), 200
