import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
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

export default function ProjectsIndex({ searchQuery = "" }) {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState("");
  
  const user = useSelector((state) => state.session.user);

  const refresh = async () => {
    try {
      const d = await api("");
      setProjects(d.projects || []);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  // Filter projects by search query
  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    return projects.filter(project => 
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [projects, searchQuery]);

  const sorted = useMemo(
    () => [...filteredProjects].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)),
    [filteredProjects]
  );

  const create = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!user) {
      setError("Please log in to create projects");
      return;
    }
    
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
      setName("");
      setImageUrl("");
      setDescription("");
      setShowCreateForm(false);
    } catch (err) {
      setError("Failed to create project. Please try again.");
    }
  };

  const destroy = async (id, ownerId) => {
    if (!user) {
      alert("Please log in to delete projects");
      return;
    }
    
    if (user.id !== ownerId) {
      alert("You can only delete your own projects");
      return;
    }
    
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
          <h2>Projects</h2>
          {user && (
            <div className="create-section">
              {!showCreateForm ? (
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowCreateForm(true)}
                >
                  Create New Project
                </button>
              ) : (
                <form onSubmit={create} className="create-form">
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
                      onClick={() => {
                        setShowCreateForm(false);
                        setError("");
                        setName("");
                        setImageUrl("");
                        setDescription("");
                      }}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">Create Project</button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {searchQuery && (
          <div className="search-results">
            Found {sorted.length} project{sorted.length !== 1 ? 's' : ''} for "{searchQuery}"
          </div>
        )}

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
                {user && user.id === project.user_id && (
                  <button 
                    className="x" 
                    onClick={() => destroy(project.id, project.user_id)} 
                    title="Delete"
                  >
                    ×
                  </button>
                )}
              </div>

              <div className="owner">{project.owner || 'Unknown'}</div>
              <div className="desc">{project.description || "No description"}</div>

              <div className="actions">
                <Link to={`/projects/${project.id}/abacus`} className="btn btn-secondary">
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
              {searchQuery 
                ? `No projects found matching "${searchQuery}"`
                : "No projects yet. Create the first one!"
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
}