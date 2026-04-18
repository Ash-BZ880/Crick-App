/** Current-over stack tokens: `W`, `W+1…`, no-ball run-out `nbW`, `nbW+1…`, out-of-ground `nb+W`. */

export function isWicketStackEntry(d) {
  const s = String(d);
  return (
    s === "W" ||
    s === "nbW" ||
    s === "nb+W" ||
    /^W\+\d+$/.test(s) ||
    /^nbW\+\d+$/.test(s)
  );
}

/** Runs completed before run-out (striker); 0 for plain `W` / `nbW`. */
export function extraRunsFromWicketStackToken(d) {
  const s = String(d);
  let m = s.match(/^W\+(\d+)$/);
  if (m) return Math.min(4, Math.max(0, parseInt(m[1], 10) || 0));
  m = s.match(/^nbW\+(\d+)$/);
  if (m) return Math.min(4, Math.max(0, parseInt(m[1], 10) || 0));
  return 0;
}

export function wicketTokenBreaksMaiden(d) {
  return extraRunsFromWicketStackToken(d) > 0;
}
