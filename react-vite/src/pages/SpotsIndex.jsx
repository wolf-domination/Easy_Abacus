import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

export default function SpotsIndex() {
  const [spots, setSpots] = useState([]);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const nav = useNavigate();

  const load = async () => {
    const r = await fetch("/api/spots", { credentials: "same-origin" });
    if (!r.ok) return;
    const data = await r.json();
    setSpots(data.spots || []);
  };
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    if (!name.trim() || creating) return;
    setCreating(true);
    try {
      const csrf = Cookies.get("XSRF-TOKEN") ?? "";
      const r = await fetch("/api/spots", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "XSRF-Token": csrf,
        },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!r.ok) {
        console.error("Create failed:", await r.text());
        return;
      }
      const s = await r.json();
      setName("");
      nav(`/spots/${s.id}/abacus`);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div style={{ padding: "1rem", maxWidth: 900, margin: "0 auto" }}>
      <h2>Spots</h2>

      <form onSubmit={create} style={{ display: "flex", gap: 8, margin: "12px 0" }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New spot name…"
          style={{ flex: 1, padding: 8, border: "1px solid #ccc", borderRadius: 6 }}
          required
        />
        <button type="submit" disabled={!name.trim() || creating}>
          {creating ? "Creating…" : "Create"}
        </button>
      </form>

      <div style={{ borderTop: "1px solid #eee", marginTop: 12 }}>
        {spots.length === 0 && <p style={{ opacity: 0.7 }}>No spots yet — create one above.</p>}
        <ul>
          {spots.map((s) => (
            <li key={s.id} style={{ padding: "8px 0", borderBottom: "1px solid #f3f3f3" }}>
              <Link to={`/spots/${s.id}/abacus`} style={{ fontWeight: 600 }}>
                {s.name}
              </Link>
              <div style={{ fontSize: 12, color: "#666" }}>
                Updated {new Date(s.updatedAt).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
