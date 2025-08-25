import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./SpotsIndex.css";

const api = async (path, opts = {}) => {
  const r = await fetch(`/api/spots${path}`, {
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

export default function SpotsIndex() {
  const [spots, setSpots] = useState([]);
  const [name, setName] = useState("");

  const refresh = async () => {
    const d = await api("");
    setSpots(d.spots || []);
  };

  useEffect(() => {
    refresh();
  }, []);

  const sorted = useMemo(
    () => [...spots].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)),
    [spots]
  );

  const create = async (e) => {
    e.preventDefault();
    const n = name.trim();
    if (!n) return;
    const s = await api("", { method: "POST", body: JSON.stringify({ name: n }) });
    setSpots((prev) => [s, ...prev]);
    setName("");
  };

  const destroy = async (id) => {
    await api(`/${id}`, { method: "DELETE" });
    setSpots((prev) => prev.filter((s) => s.id !== id));
  };

  const uploadImage = async (id, file) => {
    if (!file) return;
    const fd = new FormData();
    fd.append("image", file);
    const s = await api(`/${id}/image`, { method: "POST", body: fd });
    setSpots((prev) => prev.map((p) => (p.id === id ? s : p)));
  };

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
                <div className="thumb-empty">No image</div>
              )}
            </div>

            <div className="meta">
              <div className="title-row">
                <h3 className="title">{s.name}</h3>
                <button className="x" onClick={() => destroy(s.id)} title="Delete">
                  ×
                </button>
              </div>

              <div className="desc">{s.description || "No description"}</div>

              <div className="actions">
                <label className="btn">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => uploadImage(s.id, e.target.files?.[0])}
                    style={{ display: "none" }}
                  />
                  Add image
                </label>
                <Link to={`/spots/${s.id}/notes`}>Open</Link>
                <Link to={`/spots/${s.id}/abacus`}>Abacus</Link>
              </div>

              <div className="time">Updated {new Date(s.updated_at).toLocaleString()}</div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
