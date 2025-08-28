import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import "./ProjectsIndex.css";

const api = async (path, opts = {}) => {
  const r = await fetch(`/api/projects${path}`, {
    credentials: "same-origin",
    headers:
      opts.body instanceof FormData
        ? { "XSRF-Token": (document.cookie.match(/XSRF-TOKEN=([^;]+)/) || [])[1] || "dev-token" }
        : {
            "Content-Type": "application/json",
            "XSRF-Token": (document.cookie.match(/XSRF-TOKEN=([^;]+)/) || [])[1] || "dev-token",
          },
    ...opts,
  });
  if (!r.ok) throw new Error(`api ${path} failed (${r.status})`);
  return r.json();
};

export default function MyProjects() {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [error, setError] = useState("");
  
  const user = useSelector((state) => state.session.user);

  // Redirect to home if not logged in
  if (!user) {
    return <Navigate to="/" replace />;
  }

  const refresh = async () => {
    try {
      const d = await api("/my-projects");
      setProjects(d.projects || []);
    } catch (err) {
      console.error("Failed to fetch my projects:", err);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const sorted = useMemo(
    () => [...projects].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)),
    [projects]
  );

  const resetForm = () => {
    setName("");
    setImageUrl("");
    setDescription("");
    setError("");
    setShowCreateForm(false);
    setEditingProject(null);
  };

  const startEdit = (project) => {
    setName(project.name);
    setImageUrl(project.image_url || "");
    setDescription(project.description || "");
    setEditingProject(project);
    setShowCreateForm(false);
    setError("");
  };

  const create = async (e) => {
    e.preventDefault();
    setError("");
    
    const n = name.trim();
    const img = imageUrl.trim();
    const desc = description.trim();
    
    if (!n) {
      setError("Project name is required");
      return;
    }
    
    if (!img) {
      setError("Image URL is required");
      return;
    }

    try {
      const project = await api("", { 
        method: "POST", 
        body: JSON.stringify({ 
          name: n, 
          image_url: img, 
          description: desc 
        }) 
      });
      setProjects((prev) => [project, ...prev]);
      resetForm();
    } catch (err) {
      setError("Failed to create project. Please try again.");
    }
  };

  const update = async (e) => {
    e.preventDefault();
    setError("");
    
    const n = name.trim();
    const img = imageUrl.trim();
    const desc = description.trim();
    
    if (!n) {
      setError("Project name is required");
      return;
    }
    
    if (!img) {
      setError("Image URL is required");
      return;
    }

    try {
      const updatedProject = await api(`/${editingProject.id}`, { 
        method: "PUT", 
        body: JSON.stringify({ 
          name: n, 
          image_url: img, 
          description: desc 
        }) 
      });
      setProjects((prev) => prev.map(p => p.id === editingProject.id ? updatedProject : p));
      resetForm();
    } catch (err) {
      setError("Failed to update project. Please try again.");
    }
  };

  const destroy = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?")) {
      return;
    }

    try {
      await api(`/${id}`, { method: "DELETE" });
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert("Failed to delete project");
    }
  };

  return (
    <div className="projects-wrap">
      <div className="projects-container">
        <div className="projects-header">
          <div>
            <h2>My Projects</h2>
            <p className="text-muted">Manage your personal projects</p>
          </div>
          
          <div className="create-section">
            {!showCreateForm && !editingProject ? (
              <button 
                className="btn btn-primary"
                onClick={() => setShowCreateForm(true)}
              >
                Create New Project
              </button>
            ) : (
              <form onSubmit={editingProject ? update : create} className="create-form">
                <h3>{editingProject ? 'Edit Project' : 'Create New Project'}</h3>
                <div className="form-row">
                  <input
                    placeholder="Project name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <input
                    placeholder="Image URL"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    required
                  />
                </div>
                <div className="form-row">
                  <textarea
                    placeholder="Project description (optional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="3"
                  />
                </div>
                {error && <div className="error alert-error">{error}</div>}
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn btn-outline"
                    onClick={resetForm}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingProject ? 'Update Project' : 'Create Project'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        <div className="grid">
          {sorted.map((project) => (
            <article key={project.id} className="card">
              <div className="thumb">
                {project.image_url ? (
                  <img 
                    src={project.image_url} 
                    alt={project.name}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className="thumb-empty" style={{ display: project.image_url ? 'none' : 'flex' }}>
                  No image
                </div>
              </div>

              <div className="meta">
                <div className="title-row">
                  <h3 className="title">{project.name}</h3>
                  <button 
                    className="x" 
                    onClick={() => destroy(project.id)} 
                    title="Delete"
                  >
                    ×
                  </button>
                </div>

                <div className="desc">{project.description || "No description"}</div>

                <div className="actions">
                  <button 
                    className="btn btn-outline"
                    onClick={() => startEdit(project)}
                  >
                    Edit
                  </button>
                  <Link to={`/projects/${project.id}/abacus`} className="btn btn-primary">
                    Open Abacus
                  </Link>
                </div>

                <div className="time">
                  Created {new Date(project.created_at).toLocaleDateString()}
                </div>
              </div>
            </article>
          ))}

          {sorted.length === 0 && (
            <div className="empty-state">
              You haven't created any projects yet. Create your first project to get started!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}