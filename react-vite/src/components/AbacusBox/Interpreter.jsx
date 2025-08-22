import { useMemo, useEffect } from "react";

/**
 * Interpreter — returns a single word by taking, for each row:
 * - the furthest filled column (rightmost filled cell count)
 * - if none filled, use the legend[0] (0's slot)
 * Reads rows top→down and columns right→left to build a word.
 * Props:
 *   width: number
 *   rows:  Array<{ y:number, count:number }>
 *   legend: string[]  // [0's, col1, col2, ...]
 *   topToBottom: boolean (default true)
 *   direction: 'rtl' | 'ltr' (default 'rtl') – how you want letters joined
 *   joiner: string (default '')
 *   onText?: (text: string) => void   // NEW — report the computed word
 */
export default function Interpreter({
  width,
  rows,
  legend,
  topToBottom = true,
  direction = "rtl",
  joiner = "",
  onText,
}) {
  const text = useMemo(() => {
    // ensure legend exists for all columns
    const safeLegend = (legend && legend.length ? legend : [""]).slice();
    while (safeLegend.length < width + 1) safeLegend.push("");

    // build per-row letter
    const rowLetters = rows.map(({ count }) => {
      if (count > 0) {
        // rightmost filled index is `count` (since cells 1..count are filled)
        const idx = Math.min(count, width); // clamp
        return safeLegend[idx] || "";
      }
      // empty row → 0's slot
      return safeLegend[0] || "";
    });

    // orientation
    const ordered = topToBottom ? rowLetters : [...rowLetters].reverse();
    const word = direction === "rtl" ? ordered.join(joiner) : [...ordered].reverse().join(joiner);
    return word;
  }, [width, rows, legend, topToBottom, direction, joiner]);

  // Report up to the parent/Phrase interpreter
  useEffect(() => {
    if (typeof onText === "function") onText(text);
  }, [text, onText]);

  return (
    <div style={{ marginTop: "0.75rem" }}>
      <strong>Interpreter:&nbsp;</strong> {text}
    </div>
  );
}
