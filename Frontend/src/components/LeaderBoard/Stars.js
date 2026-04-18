import { useEffect, useState, useCallback } from "react";
import "./Stars.css";

const Stars = () => {
  const [stats, setStats] = useState({});

  const cleanName = (name) => (name || "").replace(/\*/g, "").trim();

  // ✅ Convert cricket overs (4.2 → 4 overs + 2 balls)
  const parseOversToBalls = (overs) => {
    if (!overs) return 0;
    const [o, b] = overs.toString().split(".");
    return (parseInt(o || 0) * 6) + parseInt(b || 0);
  };

  const processData = useCallback((matches) => {
    const batterMap = {};
    const bowlerMap = {};

    matches.forEach((match) => {
      const innings = [
        {
          data: match.inning1,
          batTeam: match.scoringTeam,
          bowlTeam: match.chessingTeam,
        },
        {
          data: match.inning2,
          batTeam: match.chessingTeam,
          bowlTeam: match.scoringTeam,
        },
      ];

      innings.forEach(({ data: inning, batTeam, bowlTeam }) => {
        if (!inning) return;

        // ================= BATTERS =================
        (inning.batters || []).forEach((b) => {
          const name = cleanName(b.name);
          if (!name) return;

          if (!batterMap[name]) {
            batterMap[name] = {
              name,
              team: batTeam,
              runs: 0,
              balls: 0,
              innings: 0,
              fours: 0,
              sixes: 0,
              highScore: 0,
              fifties: 0,
              hundreds: 0,
              bestVs: "",
            };
          }

          const p = batterMap[name];

          // ✅ Always keep correct team
          p.team = batTeam;

          const runs = Number(b.run) || 0;
          const balls = Number(b.ball) || 0;

          p.runs += runs;
          p.balls += balls;
          p.innings += 1;
          p.fours += Number(b.four) || 0;
          p.sixes += Number(b.six) || 0;

          if (runs > p.highScore) {
            p.highScore = runs;
            p.bestVs = bowlTeam;
          }

          if (runs >= 100) p.hundreds++;
          else if (runs >= 50) p.fifties++;
        });

        // ================= BOWLERS =================
        (inning.bowlers || []).forEach((b) => {
          const name = cleanName(b.name);
          if (!name) return;

          if (!bowlerMap[name]) {
            bowlerMap[name] = {
              name,
              team: bowlTeam,
              wickets: 0,
              runs: 0,
              balls: 0,
              innings: 0,
            };
          }

          const p = bowlerMap[name];

          // ✅ Always keep correct team
          p.team = bowlTeam;

          p.wickets += Number(b.wicket) || 0;
          p.runs += Number(b.run) || 0;
          p.balls += parseOversToBalls(b.over);

          p.innings += 1;
        });
      });
    });

    // ================= FINAL CALC =================
    const batters = Object.values(batterMap).map((p) => ({
      ...p,
      avg: p.innings ? (p.runs / p.innings).toFixed(2) : "0.00",
      strikeRate: p.balls
        ? ((p.runs / p.balls) * 100).toFixed(2)
        : "0.00",
    }));

    const bowlers = Object.values(bowlerMap).map((p) => {
      const overs = p.balls / 6;
      return {
        ...p,
        overs: overs.toFixed(1),
        avg: p.wickets ? (p.runs / p.wickets).toFixed(2) : "-",
        economy: overs ? (p.runs / overs).toFixed(2) : "-",
      };
    });

    // helper for numeric sort
    const num = (v) => (v === "-" ? Infinity : Number(v));

    setStats({
      mostRuns: [...batters].sort((a, b) => b.runs - a.runs).slice(0, 5),
      highScore: [...batters].sort((a, b) => b.highScore - a.highScore).slice(0, 5),
      bestSR: [...batters].sort((a, b) => num(b.strikeRate) - num(a.strikeRate)).slice(0, 5),
      bestAvg: [...batters].sort((a, b) => num(b.avg) - num(a.avg)).slice(0, 5),
      most4s: [...batters].sort((a, b) => b.fours - a.fours).slice(0, 5),
      most6s: [...batters].sort((a, b) => b.sixes - a.sixes).slice(0, 5),
      most100s: [...batters].sort((a, b) => b.hundreds - a.hundreds).slice(0, 5),
      most50s: [...batters].sort((a, b) => b.fifties - a.fifties).slice(0, 5),

      mostWickets: [...bowlers].sort((a, b) => b.wickets - a.wickets).slice(0, 5),
      bestEco: [...bowlers].sort((a, b) => num(a.economy) - num(b.economy)).slice(0, 5),
      bestAvgBowl: [...bowlers].sort((a, b) => num(a.avg) - num(b.avg)).slice(0, 5),
    });
  }, []);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_BASE_URL}/live/match/all`)
      .then((res) => res.json())
      .then(processData)
      .catch(console.error);
  }, [processData]);

  const renderTable = (title, list, cols) => (
    <div className="table-card">
      <h3 className="table-title">{title}</h3>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Pos</th>
              <th>Player</th>
              {cols.map((c) => (
                <th key={c.key}>{c.label}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {list?.map((p, i) => (
              <tr key={i}>
                <td>{i + 1}</td>

                <td>
                  <div className="player">
                    <div className="avatar">{p.name[0]}</div>
                    <div>
                      <div className="name">{p.name}</div>
                      <div className="team">{p.team}</div>
                    </div>
                  </div>
                </td>

                {cols.map((c) => (
                  <td key={c.key}>{p[c.key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (stats.mostRuns?.length === 0) {
    return (
      <div className="Imgdiv">
        <img
          className="NoMatchLive"
          src="/images/A1.png"
          alt="No match available"
        />
      </div>
    );
  } else {



  return (
    <div className="stars-container">

      {renderTable("Most Runs", stats.mostRuns, [
        { key: "runs", label: "R" },
        { key: "innings", label: "Inn" },
        { key: "avg", label: "Avg" },
      ])}

      {renderTable("Highest Score", stats.highScore, [
        { key: "highScore", label: "Score" },
        { key: "balls", label: "Balls" },
        { key: "strikeRate", label: "SR" },
        { key: "bestVs", label: "VS" },
      ])}

      {renderTable("Best Strike Rate", stats.bestSR, [
        { key: "strikeRate", label: "SR" },
        { key: "innings", label: "Inn" },
        { key: "runs", label: "Runs" },
      ])}

      {renderTable("Best Average", stats.bestAvg, [
        { key: "avg", label: "Avg" },
        { key: "innings", label: "Inn" },
        { key: "runs", label: "Runs" },
      ])}

      {renderTable("Most 4s", stats.most4s, [
        { key: "fours", label: "4s" },
        { key: "innings", label: "Inn" },
        { key: "runs", label: "Runs" },
      ])}

      {renderTable("Most 6s", stats.most6s, [
        { key: "sixes", label: "6s" },
        { key: "innings", label: "Inn" },
        { key: "runs", label: "Runs" },
      ])}

      {renderTable("Most 100s", stats.most100s, [
        { key: "hundreds", label: "100s" },
        { key: "innings", label: "Inn" },
        { key: "runs", label: "Runs" },
      ])}

      {renderTable("Most 50s", stats.most50s, [
        { key: "fifties", label: "50s" },
        { key: "innings", label: "Inn" },
        { key: "runs", label: "Runs" },
      ])}

      {renderTable("Most Wickets", stats.mostWickets, [
        { key: "wickets", label: "W" },
        { key: "innings", label: "Inn" },
        { key: "overs", label: "Overs" },
        { key: "runs", label: "Runs" },
        { key: "avg", label: "Avg" },
      ])}

      {renderTable("Best Economy", stats.bestEco, [
        { key: "economy", label: "Eco" },
        { key: "overs", label: "Overs" },
        { key: "runs", label: "Runs" },
      ])}

      {renderTable("Best Bowling Average", stats.bestAvgBowl, [
        { key: "avg", label: "Avg" },
        { key: "wickets", label: "W" },
        { key: "runs", label: "Runs" },
      ])}

    </div>
  );
}
};

export default Stars;