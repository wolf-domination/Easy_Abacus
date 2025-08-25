import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./SpotsIndex.css";

const api = async (path, opts = {}) => {
  const r = await fetch(`/api/spots${path}`, {
    credentials: "same-origin",
    ...opts,
  });
  if (!r.ok) {
    const t = await r.text().catch(() => "");
    throw new Error(`spots api ${path} failed (${r.status}) ${t}`);
  }
  return r.headers.get("content-type")?.includes("application/json")
    ? r.json()
    : r.text();
};

export default function SpotsIndex() {
  const [spots, setSpots] = useState([]);
  const [name, setName] = useState("");

  const load = () => api("").then((d) => setSpots(d.spots || []));
  useEffect(() => {
    load();
  }, []);

  const create = async (e) => {
    e.preventDefault();
    const n = name.trim();
    if (!n) return;
    await api("", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: n }),
    });
    setName("");
    load();
  };

  const del = async (id) => {
    if (!confirm("Delete this project?")) return;
    await api(`/${id}`, { method: "DELETE" });
    load();
  };

  const uploadThumb = async (id, file) => {
    const fd = new FormData();
    fd.append("image", file);
    await fetch(`/api/spots/${id}/thumbnail`, {
      method: "POST",
      body: fd,
      credentials: "same-origin",
    }).then((r) => {
      if (!r.ok) throw new Error("upload failed");
    });
    load();
  };

  const sorted = useMemo(
    () =>
      [...spots].sort(
        (a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0)
      ),
    [spots]
  );

  return (
    <div className="spots-wrap">
      <div className="spots-header">
        <h2>Projects</h2>
        <form onSubmit={create} className="create-form">
          <input
            placeholder="New project name…"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button>Create</button>
        </form>
      </div>

      <div className="grid">
        {sorted.map((s) => (
          <article key={s.id} className="card">
            <div className="thumb">
              {s.thumbnail_url ? (
                <img src={s.thumbnail_url} alt={s.name} />
              ) : (
                <label className="uploader">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadThumb(s.id, f);
                      e.currentTarget.value = "";
                    }}
                  />
                  Add Image
                </label>
              )}
            </div>

            <div className="card-body">
              <div className="title-row">
                <h3 className="title">{s.name}</h3>
                <button
                  className="delete"
                  aria-label="Delete project"
                  onClick={() => del(s.id)}
                >
                  ×
                </button>
              </div>

              <p className="desc">{s.description || "No description"}</p>

              <div className="actions">
                <Link to={`/spots/${s.id}/notes`}>Open</Link>
                <Link to={`/spots/${s.id}/abacus`}>Abacus</Link>
              </div>

              <div className="meta">
                {s.updated_at
                  ? `Updated ${new Date(s.updated_at).toLocaleString()}`
                  : "Updated Unknown"}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
