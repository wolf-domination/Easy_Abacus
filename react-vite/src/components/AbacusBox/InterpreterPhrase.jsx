import { useEffect, useMemo, useState } from "react";

/**
 * InterpreterPhrase
 * - Shows a vertical legend (• = dot) aligned to your main legend.
 * - Each row has an input; editing one row changes ONLY that row’s mapping.
 * - Builds a phrase by mapping each character of `text` through the row values.
 *
 * Props:
 *   - text:   string from the top interpreter (e.g., "FEED_DAD")
 *   - legend: array of legend characters, including the 0's slot at index 0
 */
export default function InterpreterPhrase({ text = "", legend = [] }) {
  // One phrase entry per legend slot (including the 0's place at index 0)
  const [phrases, setPhrases] = useState(() => legend.map(() => ""));

  // Keep phrases array length in sync with legend length
  useEffect(() => {
    setPhrases((prev) => {
      const next = prev.slice(0, legend.length);
      while (next.length < legend.length) next.push("");
      return next;
    });
  }, [legend]);

  // Map each character in `text` to its phrase, falling back to the char itself
  const output = useMemo(() => {
    if (!text) return "";
    // Build quick lookup: char -> index in legend
    const indexOfChar = new Map();
    legend.forEach((ch, i) => {
      if (ch) indexOfChar.set(ch, i);
    });

    // Replace each character using the row’s phrase (if present)
    return Array.from(text).map((ch) => {
      const i = indexOfChar.get(ch);
      if (i === undefined) return ch;         // not found in legend, leave as is
      return phrases[i] !== "" ? phrases[i] : ch; // if blank, keep original char
    }).join("");
  }, [text, legend, phrases]);

  return (
    <div style={{ marginTop: "1.25rem" }}>
      <div style={{ fontWeight: 600, marginBottom: "0.5rem" }}>
        Interpreter 2:&nbsp; <span style={{ fontWeight: 400 }}>{output}</span>
      </div>

      {/* Vertical legend (top row corresponds to legend[0] — the 0's place) */}
      <div style={{ display: "grid", rowGap: "8px", maxWidth: 520 }}>
        {legend.map((ch, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "auto auto 1fr",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>•</span>
            <span>=</span>
            <input
              value={phrases[i] ?? ""}
              onChange={(e) => {
                const val = e.target.value;
                setPhrases((prev) => {
                  const copy = prev.slice();
                  copy[i] = val;        // ✅ update only the edited row
                  return copy;
                });
              }}
              placeholder={ch ? `(${ch})` : "(0)"}
              style={{
                width: "100%",
                height: "22px",
                padding: "2px 6px",
                boxSizing: "border-box",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
