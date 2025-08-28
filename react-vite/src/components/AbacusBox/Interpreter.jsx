import { useMemo, useEffect } from "react";

/**
 * Interpreter — returns a single word by taking, for each row:
 * - the furthest filled column (rightmost filled cell count)
 * - if none filled, use the legend[0] (0's slot)
 * Numeric value contributed by a row = that column index (0..width)
 *
 * Props:
 *   width: number
 *   rows:  Array<{ y:number, count:number }>
 *   legend: string[]  // [0's, col1, col2, ...]
 *   topToBottom: boolean (default true)
 *   direction: 'rtl' | 'ltr' (default 'rtl')
 *   joiner: string (default '')
 *   onText?: (text: string) => void    // report computed word
 *   onSum?:  (sum: number) => void     // NEW: report numeric sum
 *   title?:  string                    // NEW: heading label (default "Interpreter")
 */
export default function Interpreter({
  width,
  rows,
  legend,
  topToBottom = true,
  direction = "rtl",
  joiner = "",
  onText,
  onSum,              // NEW
  title = "Interpreter", // NEW
}) {
  const { text, sum } = useMemo(() => {
    // ensure legend exists for all columns
    const safeLegend = (legend && legend.length ? legend : [""]).slice();
    while (safeLegend.length < width + 1) safeLegend.push("");

    // build per-row letter + numeric value
    const items = rows.map(({ count }) => {
      if (count > 0) {
        const idx = Math.min(count, width); // rightmost filled index
        return { sym: safeLegend[idx] || "", val: idx };
      }
      return { sym: safeLegend[0] || "", val: 0 };
    });

    const ordered = topToBottom ? items : [...items].reverse();

    const word =
      direction === "rtl"
        ? ordered.map((r) => r.sym).join(joiner)
        : [...ordered].reverse().map((r) => r.sym).join(joiner);

    const sumVal = ordered.reduce((acc, r) => acc + r.val, 0);

    return { text: word, sum: sumVal };
  }, [width, rows, legend, topToBottom, direction, joiner]);

  // Report up
  useEffect(() => {
    if (typeof onText === "function") onText(text);
  }, [text, onText]);

  useEffect(() => {
    if (typeof onSum === "function") onSum(sum);
  }, [sum, onSum]);

  return (
    <div style={{ marginTop: "0.75rem" }}>
      <strong>{title}:&nbsp;</strong> {text} <span style={{ opacity: 0.7 }}>(sum = {sum})</span>
    </div>
  );
}
