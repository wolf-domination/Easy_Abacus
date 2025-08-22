


import React from "react";

/**
 * BinaryRows
 * Renders a 1/0 grid mirroring the Base(n−1) rows.
 * Props:
 *  - rows: [{ y, count }]   // from your existing baseRows
 *  - width: number          // state.width
 *  - cell?: number          // default 20 (match your Abacus)
 *  - colGap?: number        // default 4
 *  - rowGap?: number        // default 6
 *  - topToBottom?: boolean  // default true (y=MAX..0, like your renderer)
 */
export default function BinaryRows({
  rows,
  width,
  cell = 20,
  colGap = 4,
  rowGap = 6,
  topToBottom = true,
}) {
  const ordered = topToBottom ? rows : [...rows].reverse();

  return (
    <div style={{ display: "grid", rowGap: "8px", marginTop: "16px" }}>
      <h3 style={{ margin: 0 }}>Binary (1/0) rows</h3>

      <div style={{ display: "grid", rowGap: `${rowGap}px` }}>
        {ordered.map(({ y, count }) => (
          <div
            key={y}
            title={`binary row y=${y}`}
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${width}, ${cell}px)`,
              columnGap: `${colGap}px`,
              alignItems: "center",
            }}
          >
            {[...Array(width)].map((_, i) => {
              const isOne = i < count; // same logic as your box fill
              return (
                <div
                  key={i}
                  style={{
                    width: `${cell}px`,
                    height: `${cell}px`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid #ccc",
                    fontFamily: "monospace",
                    fontSize: "12px",
                    boxSizing: "border-box",
                    background: "white",
                  }}
                >
                  {isOne ? "1" : "0"}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
