import { useEffect, useMemo, useRef, useState } from "react";

const LS_KEY = "easy_abacus_notes_v2";

// ---- helpers ----
const now = () => new Date().toISOString();
const uid = () => Math.random().toString(36).slice(2, 10);

function titleFrom(body) {
  const firstLine = (body || "").split(/\r?\n/, 1)[0];
  const t = firstLine.trim();
  return t || "Untitled";
}
function previewFrom(body) {
  const lines = (body || "").split(/\r?\n/);
  const rest = lines.slice(1).join(" ").trim();
  return rest.slice(0, 80);
}
function fmtTime(iso) {
  const d = new Date(iso);
  return d.toLocaleString();
}

export default function Notes() {
  // all notes
  const [notes, setNotes] = useState([]);
  // which is open
  const [activeId, setActiveId] = useState(null);
  // editor text (kept separate for debounce + snappy typing)
  const [text, setText] = useState("");

  // --- load once ---
  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setNotes(Array.isArray(parsed) ? parsed : []);
        if (parsed?.length) {
          setActiveId(parsed[0].id);
          setText(parsed[0].body || "");
        }
      } catch {
        // ignore bad payload
      }
    }
  }, []);

  // active note object
  const activeNote = useMemo(
    () => notes.find((n) => n.id === activeId) || null,
    [notes, activeId]
  );

  // update editor when active note changes
  useEffect(() => {
    setText(activeNote?.body ?? "");
  }, [activeNote?.id]); // only when switching notes

  // ---- autosave (debounced) ----
  const saveTimer = useRef(null);
  useEffect(() => {
    // if no active note, just persist notes array
    localStorage.setItem(LS_KEY, JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    if (!activeNote) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === activeId
            ? {
                ...n,
                body: text,
                title: titleFrom(text),
                preview: previewFrom(text),
                updatedAt: now(),
              }
            : n
        )
      );
    }, 250);
    return () => clearTimeout(saveTimer.current);
  }, [text, activeId]); // debounced body writeback

  // ---- actions ----
  const createNote = () => {
    const id = uid();
    const base = {
      id,
      title: "Untitled",
      preview: "",
      body: "",
      updatedAt: now(),
      createdAt: now(),
    };
    setNotes((prev) => [base, ...prev]); // newest on top
    setActiveId(id);
    setText("");
  };

  const deleteNote = (id) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (id === activeId) {
      // pick next note
      setTimeout(() => {
        const remaining = notes.filter((n) => n.id !== id);
        if (remaining.length) {
          setActiveId(remaining[0].id);
          setText(remaining[0].body || "");
        } else {
          setActiveId(null);
          setText("");
        }
      }, 0);
    }
  };

  const selectNote = (id) => {
    if (id === activeId) return;
    setActiveId(id);
  };

  // ---- layout styles ----
  const styles = {
    wrap: {
      display: "grid",
      gridTemplateColumns: "280px 1fr",
      height: "calc(100vh - 80px)", // leave space for nav; tweak if needed
      gap: "0px",
    },
    side: {
      borderRight: "1px solid #e5e5e5",
      display: "flex",
      flexDirection: "column",
      minWidth: 0,
    },
    toolbar: {
      display: "flex",
      gap: 8,
      alignItems: "center",
      padding: "10px",
      borderBottom: "1px solid #eee",
    },
    plus: {
      padding: "6px 10px",
      fontSize: 14,
      border: "1px solid #ccc",
      borderRadius: 6,
      background: "#fff",
      cursor: "pointer",
    },
    list: {
      overflow: "auto",
    },
    item: (active) => ({
      display: "grid",
      gridTemplateColumns: "1fr auto",
      gap: 8,
      padding: "10px 12px",
      borderBottom: "1px solid #f1f1f1",
      background: active ? "#f2f6ff" : "transparent",
      cursor: "pointer",
    }),
    itemTitle: { fontWeight: 600, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
    itemPreview: { fontSize: 12, color: "#666", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
    time: { fontSize: 11, color: "#999" },
    delBtn: {
      border: "none",
      background: "transparent",
      color: "#c33",
      cursor: "pointer",
      fontSize: 14,
      padding: 0,
    },
    editorWrap: { display: "flex", flexDirection: "column", minWidth: 0 },
    editorHeader: { padding: "10px 12px", borderBottom: "1px solid #eee", color: "#666" },
    textarea: {
      flex: 1,
      width: "100%",
      border: "none",
      outline: "none",
      resize: "none",
      fontSize: 16,
      lineHeight: 1.5,
      padding: "12px",
      boxSizing: "border-box",
    },
    emptyState: { padding: 24, color: "#666" },
  };

  return (
    <div style={{ padding: "1rem" }}>
      <div style={styles.wrap}>
        {/* Sidebar */}
        <aside style={styles.side}>
          <div style={styles.toolbar}>
            <button style={styles.plus} onClick={createNote}>＋ New</button>
            <div style={{ marginLeft: "auto", fontSize: 12, color: "#888" }}>
              {notes.length} note{notes.length !== 1 ? "s" : ""}
            </div>
          </div>
          <div style={styles.list}>
            {notes.length === 0 && (
              <div style={styles.emptyState}>No notes yet. Click <b>New</b> to create one.</div>
            )}
            {notes.map((n) => {
              const active = n.id === activeId;
              return (
                <div
                  key={n.id}
                  style={styles.item(active)}
                  onClick={() => selectNote(n.id)}
                >
                  <div>
                    <div style={styles.itemTitle}>{n.title}</div>
                    <div style={styles.itemPreview}>{n.preview || "…"}</div>
                    <div style={styles.time}>{fmtTime(n.updatedAt)}</div>
                  </div>
                  <button
                    title="Delete"
                    style={styles.delBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("Delete this note?")) deleteNote(n.id);
                    }}
                  >
                    🗑
                  </button>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Editor */}
        <section style={styles.editorWrap}>
          <div style={styles.editorHeader}>
            {activeNote ? (
              <>
                <b>{activeNote.title}</b>{" "}
                <span style={{ color: "#999" }}>
                  — last edited {fmtTime(activeNote.updatedAt)}
                </span>
              </>
            ) : (
              "No note selected"
            )}
          </div>

          {activeNote ? (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Start typing…"
              style={styles.textarea}
            />
          ) : (
            <div style={styles.emptyState}>
              Choose a note on the left, or click <b>New</b>.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
