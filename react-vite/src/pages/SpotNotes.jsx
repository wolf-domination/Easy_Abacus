import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

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

export default function SpotNotes() {
  const { id } = useParams();
  const spotId = Number(id);

  const [spot, setSpot] = useState(null);
  const [notes, setNotes] = useState([]);
  const [body, setBody] = useState("");

  useEffect(() => {
    if (!spotId) return;
    api(`/${spotId}`).then(setSpot).catch(() => setSpot(null));
    api(`/${spotId}/notes`).then((d) => setNotes(d.notes || [])).catch(() => setNotes([]));
  }, [spotId]);

  const addNote = async (e) => {
    e.preventDefault();
    if (!body.trim()) return;
    const n = await api(`/${spotId}/notes`, {
      method: "POST",
      body: JSON.stringify({ body }),
    });
    setNotes((prev) => [...prev, n]);
    setBody("");
  };

  const delNote = async (noteId) => {
    await api(`/${spotId}/notes/${noteId}`, { method: "DELETE" });
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  };

  if (!spotId) return <div>Not found.</div>;
  if (!spot) return <div>Loading…</div>;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "1rem" }}>
      <Link to="/spots">← Back to Projects</Link>

      <h2 style={{ marginTop: 12 }}>{spot.name}</h2>
      <div style={{ color: "#666", marginBottom: 8 }}>
        Spot ID: {spot.id} • Description: {spot.description || "No description"}
      </div>

      <form onSubmit={addNote} style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write a note…"
          style={{ flex: 1, height: 32, padding: "4px 8px" }}
        />
        <button type="submit">Add</button>
      </form>

      {notes.length === 0 ? (
        <div style={{ opacity: 0.7 }}>No notes yet.</div>
      ) : (
        <ul style={{ display: "grid", gap: 10, padding: 0, listStyle: "none" }}>
          {notes.map((n) => (
            <li
              key={n.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: 6,
                padding: "8px 10px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>{n.body}</span>
              <button onClick={() => delNote(n.id)} title="Delete" aria-label="Delete">
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
