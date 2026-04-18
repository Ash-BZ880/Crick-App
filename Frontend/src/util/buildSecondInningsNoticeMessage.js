/**
 * Chase "needs … runs in … balls" vs final "won by … / Match Tied" for 2nd innings.
 * Uses completed `inning2` on `match` when live counters are cleared (admin after end) or
 * when `hasMatchEnded` / chase is logically over (viewer polling).
 */
export function buildSecondInningsNoticeMessage({
  inningNo,
  inning1,
  inning2,
  maxOver,
  totalWicket,
  scoringTeam,
  chessingTeam,
  totalRuns,
  wicketCount,
  overCount,
  hasMatchEnded,
  remainingRuns,
  remainingBalls,
}) {
  const sc = scoringTeam ?? "";
  const ch = chessingTeam ?? "";
  const i1 = inning1 || {};
  const i2 = inning2 || {};
  const tw = Number(totalWicket) || 10;
  const mo = Number(maxOver) || 20;

  const remForDisplay = Math.max(0, Number(remainingRuns) || 0);
  const needsLine = `${inningNo === 1 ? sc : ch} needs ${remForDisplay} ${
    remForDisplay <= 1 ? "run" : "runs"
  } in ${remainingBalls ?? 0} ${
    (remainingBalls ?? 0) <= 1 ? "ball" : "balls"
  } to win`;

  if (inningNo !== 2) {
    return needsLine;
  }

  const target = (i1.runs ?? 0) + 1;

  const r2 =
    hasMatchEnded || i2.runs != null ? i2.runs ?? 0 : totalRuns ?? 0;
  const w2 =
    hasMatchEnded || i2.wickets != null ? i2.wickets ?? 0 : wicketCount ?? 0;

  let oc = overCount ?? 0;
  if (
    (hasMatchEnded || (i2.runs != null && i2.overs != null && i2.overs !== "")) &&
    i2.overs != null &&
    i2.overs !== ""
  ) {
    const p = parseFloat(String(i2.overs));
    if (!Number.isNaN(p)) {
      oc = Math.floor(p + 1e-9);
    }
  }

  const chaseComplete =
    !!hasMatchEnded ||
    (remainingBalls ?? 0) <= 0 ||
    (remainingRuns ?? 0) <= 0 ||
    w2 >= tw ||
    oc >= mo ||
    (r2 >= target && w2 < tw && oc <= mo);

  if (!chaseComplete) {
    return needsLine;
  }

  if (w2 < tw && oc <= mo && r2 >= target) {
    return `${ch} won by ${tw - w2} wickets`;
  }
  if ((w2 >= tw || oc >= mo) && r2 < target - 1) {
    return `${sc} won by ${target - r2 - 1} runs`;
  }
  if (w2 < tw && oc >= mo && r2 === target - 1) {
    return "Match Tied";
  }

  if (r2 >= target) {
    return `${ch} won by ${Math.max(0, tw - w2)} wickets`;
  }

  // Counter can go negative before `r2`/`target` align in state; still a chase win.
  if ((remainingRuns ?? 0) < 0 && w2 < tw && oc <= mo) {
    return `${ch} won by ${Math.max(0, tw - w2)} wickets`;
  }

  return needsLine;
}
