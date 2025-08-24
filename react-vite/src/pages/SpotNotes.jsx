import { useEffect, useMemo, useRef, useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";

const LS_KEY = (id) => `easy_abacus_notes_spot_${id}`;
const now = () => new Date().toISOString();
const uid = () => Math.random().toString(36).slice(2, 10);
const titleFrom = (b) => (b || "").split(/\r?\n/, 1)[0].trim() || "Untitled";
const previewFrom = (b) => (b || "").split(/\r?\n/).slice(1).join(" ").trim().slice(0, 80);

export default function SpotNotes() {
  const { spotId } = useParams();
  const { spot } = useOutletContext();
  const storageKey = LS_KEY(spotId);

  const [notes, setNotes] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [text, setText] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem(storageKey);
    const list = raw ? JSON.parse(raw) : [];
    setNotes(Array.isArray(list) ? list : []);
    if (list?.length) { setActiveId(list[0].id); setText(list[0].body || ""); }
    else { setActiveId(null); setText(""); }
  }, [storageKey]);

  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify(notes)); }, [notes, storageKey]);

  const active = useMemo(() => notes.find(n => n.id === activeId) || null, [notes, activeId]);
  useEffect(() => { setText(active?.body ?? ""); }, [active?.id]);

  const saveTimer = useRef(null);
  useEffect(() => {
    if (!active) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      setNotes(prev => prev.map(n => n.id === activeId ? {
        ...n, body: text, title: titleFrom(text), preview: previewFrom(text), updatedAt: now()
      } : n));
    }, 250);
    return () => clearTimeout(saveTimer.current);
  }, [text, activeId, active]);

  const createNote = () => {
    const id = uid();
    const base = { id, title: "Untitled", preview: "", body: "", createdAt: now(), updatedAt: now() };
    setNotes(prev => [base, ...prev]);
    setActiveId(id);
    setText("");
  };

  const deleteNote = (id) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    if (id === activeId) {
      const remaining = notes.filter(n => n.id !== id);
      if (remaining.length) { setActiveId(remaining[0].id); setText(remaining[0].body || ""); }
      else { setActiveId(null); setText(""); }
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", height: "calc(100vh - 140px)" }}>
      <aside style={{ borderRight: "1px solid #eee", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: 10, borderBottom: "1px solid #eee", display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={createNote}>＋ New</button>
          <div style={{ marginLeft: "auto", fontSize: 12, color: "#888" }}>
            {notes.length} note{notes.length !== 1 ? "s" : ""}
          </div>
        </div>
        <div style={{ overflow: "auto" }}>
          {notes.length === 0 && <div style={{ padding: 12, color: "#666" }}>No notes for <b>{spot.name}</b>.</div>}
          {notes.map(n => (
            <div
              key={n.id}
              onClick={() => setActiveId(n.id)}
              style={{
                padding: "10px 12px", borderBottom: "1px solid #f5f5f5",
                background: n.id === activeId ? "#f2f6ff" : "transparent", cursor: "pointer",
                display: "grid", gridTemplateColumns: "1fr auto", gap: 8
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {n.title}
                </div>
                <div style={{ fontSize: 12, color: "#666", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {n.preview || "…"}
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); if (confirm("Delete this note?")) deleteNote(n.id); }}
                style={{ border: "none", background: "transparent", color: "#c33", cursor: "pointer" }}
                title="Delete"
              >🗑</button>
            </div>
          ))}
        </div>
      </aside>

      <section style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div style={{ padding: "10px 12px", borderBottom: "1px solid #eee", color: "#666" }}>
          {active ? <><b>{active.title}</b> — last edited {new Date(active.updatedAt).toLocaleString()}</> : "No note selected"}
        </div>
        {active ? (
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={`Notes for ${spot.name}…`}
            style={{ flex: 1, border: "none", outline: "none", resize: "none", padding: 12, fontSize: 16, lineHeight: 1.5 }}
          />
        ) : (
          <div style={{ padding: 24, color: "#666" }}>Choose a note or create a new one.</div>
        )}
      </section>
    </div>
  );
}
