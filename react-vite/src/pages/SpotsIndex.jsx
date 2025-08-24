import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import "./SpotsIndex.css";

const api = async (path, opts = {}) => {
  const r = await fetch(`/api/spots${path}`, {
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    ...opts,
  });
  if (!r.ok) throw new Error(`${r.status}`);
  return r.json();
};

export default function SpotsIndex() {
  const [spots, setSpots] = useState([]);
  const [name, setName] = useState("");
  const [thumb, setThumb] = useState("");

  const load = () => api("").then((d) => setSpots(d.spots || []));

  // ✅ Important: don't pass `load` directly; wrap it so the effect returns nothing.
  useEffect(() => {
    load();
  }, []);

  const create = async (e) => {
    e.preventDefault();
    const body = JSON.stringify({
      name: name.trim(),
      thumbnail_url: thumb.trim() || null,
    });
    const s = await api("", { method: "POST", body });
    setSpots((prev) => [s, ...prev]);
    setName("");
    setThumb("");
  };

  const prettyDate = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return isNaN(d) ? "—" : d.toLocaleString();
  };

  const sorted = useMemo(
    () =>
      [...spots].sort(
        (a, b) =>
          new Date(b.updated_at || 0).getTime() -
          new Date(a.updated_at || 0).getTime()
      ),
    [spots]
  );

  return (
    <div className="spots-page">
      <h1>Spots</h1>

      <form className="new-spot-form" onSubmit={create}>
        <input
          className="text"
          placeholder="New spot name…"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          className="text"
          placeholder="Thumbnail image URL (optional)"
          value={thumb}
          onChange={(e) => setThumb(e.target.value)}
        />
        <button className="btn" type="submit" disabled={!name.trim()}>
          Create
        </button>
      </form>

      <div className="spots-grid">
        {sorted.map((s) => (
          <Link key={s.id} to={`/spots/${s.id}/abacus`} className="spot-card">
            <div className="thumb-wrap">
              {s.thumbnail_url ? (
                <img
                  src={s.thumbnail_url}
                  alt={`${s.name} thumbnail`}
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://via.placeholder.com/400x240?text=No+Image";
                  }}
                />
              ) : (
                <div className="thumb-fallback">
                  {s.name[0]?.toUpperCase() || "•"}
                </div>
              )}
            </div>
            <div className="card-body">
              <div className="spot-name">{s.name}</div>
              <div className="spot-updated">
                Updated {prettyDate(s.updated_at)}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
