from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app.models import db, Project

project_routes = Blueprint("projects", __name__, url_prefix="/api/projects")


@project_routes.route("", methods=["GET"])
def index():
    """Get all projects (public endpoint)"""
    projects = Project.query.order_by(Project.updated_at.desc()).all()
    return {"projects": [p.to_dict() for p in projects]}


@project_routes.route("", methods=["POST"])
@login_required
def create():
    """Create a new project (requires login)"""
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    image_url = (data.get("image_url") or "").strip()
    description = (data.get("description") or "").strip()
    
    if not name:
        return {"errors": {"name": "Project name is required"}}, 400
    
    if not image_url:
        return {"errors": {"image_url": "Image URL is required"}}, 400

    project = Project(
        name=name, 
        image_url=image_url,
        description=description,
        user_id=current_user.id
    )
    db.session.add(project)
    db.session.commit()
    return project.to_dict(), 201


@project_routes.route("/<int:project_id>", methods=["GET"])
def show(project_id):
    """Get a specific project"""
    project = Project.query.get_or_404(project_id)
    return project.to_dict()


@project_routes.route("/<int:project_id>", methods=["PUT"])
@login_required
def update(project_id: int):
    """Update a project (only owner can edit)"""
    project = Project.query.get_or_404(project_id)
    
    if project.user_id != current_user.id:
        return {"errors": {"authorization": "You can only edit your own projects"}}, 403
    
    data = request.get_json(silent=True) or {}
    name = data.get("name", "").strip()
    image_url = data.get("image_url", "").strip()
    description = data.get("description", "").strip()
    
    if name:
        project.name = name
    if image_url:
        project.image_url = image_url
    if description is not None:
        project.description = description
    
    db.session.commit()
    return project.to_dict()


@project_routes.route("/<int:project_id>", methods=["DELETE"])
@login_required
def destroy(project_id: int):
    """Delete a project (only owner can delete)"""
    project = Project.query.get_or_404(project_id)
    
    if project.user_id != current_user.id:
        return {"errors": {"authorization": "You can only delete your own projects"}}, 403
    
    db.session.delete(project)
    db.session.commit()
    return {"status": "ok"}


@project_routes.route("/my-projects", methods=["GET"])
@login_required
def my_projects():
    """Get current user's projects"""
    projects = Project.query.filter_by(user_id=current_user.id).order_by(Project.updated_at.desc()).all()
    return {"projects": [p.to_dict() for p in projects]}


@project_routes.route("/search", methods=["GET"])
def search():
    """Search projects by name"""
    query = request.args.get("q", "").strip()
    if not query:
        return {"projects": []}
    
    projects = Project.query.filter(Project.name.ilike(f"%{query}%")).order_by(Project.updated_at.desc()).all()
    return {"projects": [p.to_dict() for p in projects]}