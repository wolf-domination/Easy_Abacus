import { useEffect, useMemo, useState } from "react";

import Interpreter from "./Interpreter";
import InterpreterPhrase from "./InterpreterPhrase";
import BinaryRows from "../BinaryRows/BinaryRows";






/* ===== Shared sizing (keeps base & binary aligned) ===== */
const MAX_ROWS = 16;  // visible rows; legal y = 0..MAX_ROWS-1
const cell = 20;      // px for square cell (width & height)
const colGap = 4;     // px gap between columns inside a row
const rowGap = 6;     // px gap between rows (vertical)

/* Derived total stage height (applies to both base + binary) */
const stageHeightPx = MAX_ROWS * cell + (MAX_ROWS - 1) * rowGap;

/* Dividing wall style */
const wallStyle = {
  borderLeft: "2px solid #999",
  height: `${stageHeightPx}px`,
  opacity: 0.6,
};

/* Backend API helper */
const API = (path, opts = {}) =>
  fetch(`/api/abacus${path}`, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  }).then((r) => r.json());

export default function AbacusBox() {
  /* -------- Base(n−1) (server-backed) -------- */
  const [word, setWord] = useState("");

  const [state, setState] = useState({ width: 4, rows: [], divider: 4 });
  const [base, setBase] = useState(5);
  const [y, setY] = useState(0);
  const [k, setK] = useState(1);

  const refresh = () => API("/state").then(setState);
  useEffect(() => { refresh(); }, []);
  
  
  useEffect(() => { refresh(); }, []);

  const init = async () =>
    setState(await API("/init", { method: "POST", body: JSON.stringify({ base }) }));
  const add = async () =>
    setState(await API("/add", { method: "POST", body: JSON.stringify({ y, k }) }));
  const sub = async () =>
    setState(await API("/sub", { method: "POST", body: JSON.stringify({ y, k }) }));
  const mul2 = async (steps = 1) =>
    setState(await API("/mul2", { method: "POST", body: JSON.stringify({ steps }) }));
  const div2 = async (steps = 1) =>
    setState(await API("/div2", { method: "POST", body: JSON.stringify({ steps }) }));
  const convert = async () =>
    setState(await API("/convert", { method: "POST", body: JSON.stringify({ base }) }));

  /* Build exactly MAX_ROWS rows for the base grid (top → down). */
  const baseRows = useMemo(() => {
    const counts = new Map(state.rows); // Map<y, count>
    return Array.from({ length: MAX_ROWS })
      .map((_, idx) => MAX_ROWS - 1 - idx)
      .map((yy) => ({ y: yy, count: counts.get(yy) || 0 }));
  }, [state.rows]);

  /* Layout widths */
  const baseWidthPx = state.width * cell + (state.width - 1) * colGap;

  /* -------- Legend (editable; +1 cell for 0’s slot on the left) -------- */
  const [legendLabels, setLegendLabels] = useState([]);
  useEffect(() => {
    setLegendLabels((prev) => {
      const desired = state.width + 1; // +1 for 0’s slot
      const next = prev.slice(0, desired);
      while (next.length < desired) next.push("");
      return next;
    });
  }, [state.width]);

  /* -------- Binary columns (client-only) -------- */
  // Each column: { id, beads:Set<number> }  (no carrying; row-independent)
  const [binaryCols, setBinaryCols] = useState([{ id: 1, beads: new Set() }]);
  const [nextId, setNextId] = useState(2);

  const setCols = (fn) =>
    setBinaryCols((cols) => fn(cols).map((c) => ({ ...c, beads: new Set(c.beads) })));

  const addCol = () => {
    setCols((cols) => [...cols, { id: nextId, beads: new Set() }]);
    setNextId((n) => n + 1);
  };
  const resetCols = () => setBinaryCols([{ id: 1, beads: new Set() }]);

  // +1/-1 only toggle y=0, ×2/÷2 shift all beads up/down
  const colPlus1 = (id) =>
    setCols((cols) =>
      cols.map((c) => {
        if (c.id !== id) return c;
        const b = new Set(c.beads);
        b.add(0);
        return { ...c, beads: b };
      })
    );
  const colMinus1 = (id) =>
    setCols((cols) =>
      cols.map((c) => {
        if (c.id !== id) return c;
        const b = new Set(c.beads);
        b.delete(0);
        return { ...c, beads: b };
      })
    );
  const colMul2 = (id, steps = 1) =>
    setCols((cols) =>
      cols.map((c) => {
        if (c.id !== id) return c;
        const b = new Set();
        c.beads.forEach((yy) => b.add(yy + steps));
        return { ...c, beads: b };
      })
    );
  const colDiv2 = (id, steps = 1) =>
    setCols((cols) =>
      cols.map((c) => {
        if (c.id !== id) return c;
        const b = new Set();
        c.beads.forEach((yy) => b.add(Math.max(0, yy - steps)));
        return { ...c, beads: b };
      })
    );

  const hasBead = (col, yy) => col.beads.has(yy);

  // Count beads per row across all binary columns (for merge)
  const binCountsByY = useMemo(() => {
    const m = new Map();
    binaryCols.forEach((c) => {
      c.beads.forEach((yy) => m.set(yy, (m.get(yy) || 0) + 1));
    });
    return m; // Map<y, count>
  }, [binaryCols]);

  const totalBinary = useMemo(
    () => Array.from(binCountsByY.values()).reduce((a, b) => a + b, 0),
    [binCountsByY]
  );

  // Merge: add k at the SAME y for each row with binary beads
  const mergeToBase = async () => {
    if (binCountsByY.size === 0) return;
    const rows = Array.from(binCountsByY.keys()).sort((a, b) => a - b);
    let latest = state;
    for (const yy of rows) {
      const kk = binCountsByY.get(yy) || 0;
      // eslint-disable-next-line no-await-in-loop
      latest = await API("/add", {
        method: "POST",
        body: JSON.stringify({ y: yy, k: kk }),
      });
    }
    setState(latest);
    resetCols();
  };

  return (
    <div style={{ display: "grid", gap: "1rem", padding: "1rem" }}>
      <h2>Jordan’s Base(n−1) Box + Binary Columns</h2>

      {/* Base controls */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <label>
          Base:&nbsp;
          <input
            type="number"
            min="2"
            value={base}
            onChange={(e) => setBase(parseInt(e.target.value || "2"))}
          />
        </label>
        <button onClick={init}>Init</button>
        <button onClick={convert}>Convert Base</button>
        <button onClick={refresh}>Refresh</button>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <label>
          Row y:&nbsp;
          <input
            type="number"
            min="0"
            value={y}
            onChange={(e) => setY(parseInt(e.target.value || "0"))}
          />
        </label>
        <label>
          Beads k:&nbsp;
          <input
            type="number"
            min="1"
            value={k}
            onChange={(e) => setK(parseInt(e.target.value || "1"))}
          />
        </label>
        <button onClick={add}>Add</button>
        <button onClick={sub}>Sub</button>
        <button onClick={() => mul2(1)}>×2</button>
        <button onClick={() => mul2(3)}>×2³</button>
        <button onClick={() => div2(1)}>÷2</button>
        <button onClick={() => div2(3)}>÷2³</button>
      </div>

      {/* Stats */}
      <p>
        <b>Width W:</b> {state.width} &nbsp; <b>Divider P:</b> {state.divider} &nbsp;{" "}
        <b>Σ Binary beads:</b> {totalBinary}
      </p>

      {/* ===== Stage: Base grid | wall | Binary columns ===== */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `${baseWidthPx}px 16px 1fr`,
          alignItems: "start",
          columnGap: "0.5rem",
        }}
      >
        {/* Base(n−1) grid with fixed row spacing */}
        <div style={{ display: "grid", rowGap: `${rowGap}px` }}>
          {baseRows.map(({ y, count }) => (
            <div
              key={`base-${y}`}
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${state.width}, ${cell}px)`,
                columnGap: `${colGap}px`,
                alignItems: "center",
              }}
            >
              {[...Array(state.width)].map((_, i) => {
                const filled = i < count;
                return (
                  <div
                    key={i}
                    title={`Base: y=${y}, x=${i + 1}`}
                    style={{
                      width: `${cell}px`,
                      height: `${cell}px`,
                      border: "1px solid #555",
                      background: filled ? "black" : "transparent",
                      boxSizing: "border-box", // ✅ keep rows perfect, no clipping
                    }}
                  />
                );
              })}
            </div>
          ))}

          {/* Legend (editable): shift left by one cell so 0’s hangs left of the grid */}
          <div
            aria-label="legend"
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${state.width + 1}, ${cell}px)`,
              columnGap: `${colGap}px`,
              marginTop: "8px",
              marginLeft: `-${cell + colGap}px`,
              width: `${(state.width + 1) * cell + state.width * colGap}px`,
            }}
          >
            {legendLabels.map((label, i) => (
              <input
                key={`legend-${i}`}
                value={label}
                onChange={(e) => {
                  const val = (e.target.value || "").slice(0, 1); // ✅ single char
                  setLegendLabels((prev) => {
                    const copy = prev.slice();
                    copy[i] = val;
                    return copy;
                  });
                }}
                placeholder={i === 0 ? "0" : String(i)}
                title={i === 0 ? "0’s place (left of wall)" : `Legend for x=${i}`}
                style={{
                  width: `${cell}px`,
                  height: `${cell}px`,
                  textAlign: "center",
                  border: "1px dashed #aaa",
                  fontSize: "12px",
                  padding: 0,
                  lineHeight: `${cell}px`,
                  boxSizing: "border-box",
                }}
                maxLength={1}
              />
            ))}
          </div>
        </div>

        {/* WALL */}
        <div style={wallStyle} />

        {/* Binary columns — aligned to same row spacing; controls at bottom */}
        <div
          aria-label="binary"
          style={{
            display: "grid",
            gridAutoFlow: "column",
            gridAutoColumns: `${cell}px`,
            columnGap: `${colGap}px`,
            alignItems: "start",
            height: `${stageHeightPx + cell + 8 + 48}px`, // grid area + legend height + controls
          }}
        >
          {binaryCols.map((col) => (
            <div key={col.id} style={{ width: `${cell}px`, display: "grid", rowGap: "8px" }}>
              {/* Column (top → down) */}
              <div style={{ display: "grid", rowGap: `${rowGap}px` }}>
                {Array.from({ length: MAX_ROWS })
                  .map((_, idx) => MAX_ROWS - 1 - idx)
                  .map((yy) => {
                    const filled = hasBead(col, yy);
                    return (
                      <div
                        key={`bin-${col.id}-${yy}`}
                        title={`Binary col ${col.id}: y=${yy}`}
                        style={{
                          width: `${cell}px`,
                          height: `${cell}px`,
                          border: "1px solid #555",
                          background: filled ? "black" : "transparent",
                          boxSizing: "border-box", // ✅ same as base
                        }}
                      />
                    );
                  })}
              </div>

{/* Controls at bottom (narrow, one per row to avoid overlap) */}
<div
  style={{
    display: "grid",
    gridTemplateColumns: "1fr",
    rowGap: "4px",
    // reserve a bit of space so nothing clips at the bottom
    paddingBottom: "2px",
  }}
>
  {[
    { label: "+1", onClick: () => colPlus1(col.id) },
    { label: "-1", onClick: () => colMinus1(col.id) },
    { label: "×2", onClick: () => colMul2(col.id, 1) },
    { label: "÷2", onClick: () => colDiv2(col.id, 1) },
  ].map((b, i) => (
    <button
      key={i}
      onClick={b.onClick}
      style={{
        width: "100%",        // exactly the column width (== cell)
        height: "18px",       // short so it fits nicely
        padding: "0",         // no extra width
        fontSize: "10px",     // small text to stay within cell
        lineHeight: "18px",
        boxSizing: "border-box",
      }}
      title={b.label}
    >
      {b.label}
    </button>
  ))}
</div>

            </div>
          ))}
        </div>
      </div>

            {/* Binary toolbar (global) */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <button onClick={addCol}>+ Add Binary Column</button>
        <button onClick={resetCols}>Reset Binary</button>
        <button onClick={mergeToBase} disabled={binCountsByY.size === 0}>
          🔗 Merge
        </button>
      </div>

          {/* Phrase Interpreter (takes the text from Interpreter) */}
          <Interpreter
  width={state.width}
  rows={baseRows}
  legend={legendLabels}
  direction="rtl"
  topToBottom={true}
  joiner=""
  onText={setWord}
/>

<InterpreterPhrase
  text={word}
  legend={legendLabels}
/>

{/* Binary mirror of the box rows (1/0 per cell) */}
<BinaryRows
  rows={baseRows}
  width={state.width}
  cell={20}      // or use your `cell` constant
  colGap={4}     // or `colGap`
  rowGap={6}     // or `rowGap`
  topToBottom={true}
/>


    {/* this is the ONLY closing tag for the outer wrapper */}
  </div>
);
}




