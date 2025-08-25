import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

const api = async (path, opts = {}) => {
  const r = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    ...opts,
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
};

export default function SpotNotes() {
  const { id } = useParams();
  const spotId = Number(id);

  const [spot, setSpot] = useState(null);
  const [notes, setNotes] = useState([]);
  const [newBody, setNewBody] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [s, n] = await Promise.all([
      api(`/api/spots/${spotId}`),
      api(`/api/spots/${spotId}/notes`),
    ]);
    setSpot(s);
    setNotes(n.notes || []);
    setLoading(false);
  };

  useEffect(() => {
    load().catch(() => setLoading(false));
  }, [spotId]);

  const canSave = useMemo(() => newBody.trim().length > 0, [newBody]);

  const createNote = async (e) => {
    e.preventDefault();
    if (!canSave) return;
    const created = await api(`/api/spots/${spotId}/notes`, {
      method: "POST",
      body: JSON.stringify({ body: newBody.trim() }),
    });
    setNotes((ns) => [created, ...ns]);
    setNewBody("");
  };

  const removeNote = async (noteId) => {
    await api(`/api/notes/${noteId}`, { method: "DELETE" });
    setNotes((ns) => ns.filter((n) => n.id !== noteId));
  };

  if (loading) return <div style={{ padding: 16 }}>Loading…</div>;
  if (!spot) return <div style={{ padding: 16 }}>Not found.</div>;

  return (
    <div style={{ padding: "1rem", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 8 }}>
        <Link to="/spots">← Back to Projects</Link>
      </div>

      <h2 style={{ margin: 0 }}>{spot.name}</h2>
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start", marginTop: 12 }}>
        <div
          style={{
            width: 220,
            height: 150,
            border: "1px dashed #bbb",
            borderRadius: 6,
            display: "grid",
            placeItems: "center",
            overflow: "hidden",
            background: "#fafafa",
          }}
        >
          {spot.thumbnail_url ? (
            <img
              src={spot.thumbnail_url}
              alt={`${spot.name} thumbnail`}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <span style={{ opacity: 0.6 }}>No image</span>
          )}
        </div>

        <div style={{ flex: 1 }}>
          <div><b>Spot ID:</b> {spot.id}</div>
          <div><b>Description:</b> {spot.description || "No description"}</div>
        </div>
      </div>

      <h3 style={{ marginTop: 24 }}>Notes</h3>

      <form onSubmit={createNote} style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          value={newBody}
          onChange={(e) => setNewBody(e.target.value)}
          placeholder="Write a note…"
          style={{ flex: 1, height: 34, padding: "6px 8px", border: "1px solid #bbb", borderRadius: 4 }}
        />
        <button type="submit" disabled={!canSave}>Add</button>
      </form>

      {notes.length === 0 ? (
        <div style={{ opacity: 0.7 }}>No notes yet.</div>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
          {notes.map((n) => (
            <li
              key={n.id}
              style={{ padding: "8px 10px", border: "1px solid #ddd", borderRadius: 6, background: "white" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <div style={{ whiteSpace: "pre-wrap" }}>{n.body}</div>
                <button onClick={() => removeNote(n.id)} aria-label="Delete note">✕</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
