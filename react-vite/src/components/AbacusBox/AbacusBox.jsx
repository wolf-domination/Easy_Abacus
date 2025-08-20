
import { useEffect, useState } from "react";

const API = (path, opts={}) => fetch(`/api/abacus${path}`, {
  headers: { "Content-Type": "application/json" },
  ...opts
}).then(r => r.json());

export default function AbacusBox() {
  const [state, setState] = useState({ width: 4, rows: [], divider: 4 });
  const [base, setBase] = useState(5);
  const [y, setY] = useState(0);
  const [k, setK] = useState(1);

  const refresh = () => API("/state").then(setState);

  useEffect(() => { refresh(); }, []);

  const init = async () => setState(await API("/init", { method: "POST", body: JSON.stringify({ base }) }));
  const add  = async () => setState(await API("/add",  { method: "POST", body: JSON.stringify({ y, k }) }));
  const sub  = async () => setState(await API("/sub",  { method: "POST", body: JSON.stringify({ y, k }) }));
  const mul2 = async (steps=1) => setState(await API("/mul2", { method: "POST", body: JSON.stringify({ steps }) }));
  const div2 = async (steps=1) => setState(await API("/div2", { method: "POST", body: JSON.stringify({ steps }) }));
  const convert = async () => setState(await API("/convert", { method: "POST", body: JSON.stringify({ base }) }));

  const maxY = Math.max(6, ...state.rows.map(([yy]) => yy + 2));
  const rowsAsc = [];
  for (let yy = maxY; yy >= 0; yy--) {
    const found = state.rows.find(([r]) => r === yy);
    const count = found ? found[1] : 0;
    rowsAsc.push({ y: yy, count });
  }

  return (
    <div style={{ display: "grid", gap: "1rem", padding: "1rem" }}>
      <h2>Jordan’s Base(n−1) Box</h2>

      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <label>Base: <input type="number" min="2" value={base} onChange={e=>setBase(parseInt(e.target.value||"2"))} /></label>
        <button onClick={init}>Init</button>
        <button onClick={convert}>Convert Base</button>
        <button onClick={refresh}>Refresh</button>
      </div>

      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <label>Row y: <input type="number" min="0" value={y} onChange={e=>setY(parseInt(e.target.value||"0"))} /></label>
        <label>Beads k: <input type="number" min="1" value={k} onChange={e=>setK(parseInt(e.target.value||"1"))} /></label>
        <button onClick={add}>Add</button>
        <button onClick={sub}>Sub</button>
        <button onClick={()=>mul2(1)}>×2</button>
        <button onClick={()=>mul2(3)}>×2³</button>
        <button onClick={()=>div2(1)}>÷2</button>
        <button onClick={()=>div2(3)}>÷2³</button>
      </div>

      <div>
        <p><b>Width W:</b> {state.width} &nbsp; <b>Divider P:</b> {state.divider}</p>
        <div style={{ display: "grid", gap: "6px" }}>
          {rowsAsc.map(({y, count}) => (
            <div key={y} style={{ display: "grid", gridTemplateColumns: `repeat(${state.width}, 20px)`, gap: "4px", alignItems:"center" }}>
              {[...Array(state.width)].map((_, i) => {
                const filled = i < count;
                return <div key={i} title={`y=${y}, x=${i+1}`} style={{
                  height: "20px",
                  border: "1px solid #555",
                  background: filled ? "black" : "transparent"
                }}/>;
              })}
              <span style={{ marginLeft: "8px", width:"80px" }}>y={y} ({count})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
