import React, { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import SportsCricketIcon from "@mui/icons-material/SportsCricket"; // Import the icon
import "./Scorecard.css";

/* ================= TAB CONSTANTS ================= */
const TABS = {
  MATCH: "match",
  SCORE: "score",
  POINT: "point",
};

const Scorecard = () => {
  const { id } = useParams();
  console.log(id);

  const [searchParams, setSearchParams] = useSearchParams();
  const [scores, setScores] = useState([]);
  const activeTab = searchParams.get("tab") || TABS.MATCH;
  
  const [score,setScore] = useState(null);
  const [matchData, setMatchData] = useState(null); // /api/score/:id
  const [liveData, setLiveData] = useState(null);   // /api/live/match/:scoreId
  const [info, setInfo] = useState(null);
  const [venue, setVenue] = useState(null);
  const [isSlideOpen1, setIsSlideOpen1] = useState(false);
  const [isSlideOpen2, setIsSlideOpen2] = useState(false);

  /* ================= TAB HANDLER ================= */
  const setTab = useCallback((tab) => {
    if (!Object.values(TABS).includes(tab)) return;
    setSearchParams({ tab });
  }, [setSearchParams]);

  useEffect(() => {
      const fetchScores = async () => {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_BASE_URL}/score/all`,
          );
          const allScores = response.data;
          if (Array.isArray(allScores)) {
            setScores(allScores);
          }
        } catch (error) {
          console.error("Error fetching scores:", error);
        }
      };
      fetchScores();
    }, []);

  /* ================= FETCH DATA ================= */
useEffect(() => {
  const fetchData = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/score/${id}`);

      if (!res.ok) throw new Error(await res.text());

      const result = await res.json();
      
      setScore(result);
      
      console.log(result);
      
      const match = await fetch(`${process.env.REACT_APP_API_BASE_URL}/matches/${result.matchId}`)

      if (!match.ok) throw new Error(await match.text());
      
      const matchdata = await match.json();
      
      setMatchData(matchdata);

      const liveRes = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/live/${result.scoreId}`
      );

      if (!liveRes.ok) throw new Error(await liveRes.text());

      const live = await liveRes.json();

      setLiveData(live);
      
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  if (id) fetchData();
}, [id]);

  useEffect(() => {
    const fetchSetup = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/admin/setup`
        );

        if (!res.ok) throw new Error("API failed");

        const data = await res.json();

        if (data.success && data.data) {
          setInfo(data.data.info || {});
          setVenue(data.data.venue || {});
        } else {
          // setError("No data found");
        }
      } catch (err) {
        console.error(err);
        // setError("Failed to fetch data");
      } finally {
        // setLoading(false);
      }
    };

    fetchSetup();
  }, []);

  const toggleSlide1 = () => setIsSlideOpen1((prev) => !prev);
  const toggleSlide2 = () => setIsSlideOpen2((prev) => !prev);

  const pointsTable = React.useMemo(() => {
    const table = {};
  
    // 🔥 convert "2.3" → total balls = 2*6 + 3
    const convertToBalls = (overs) => {
      if (!overs) return 0;
  
      const [o, b] = overs.toString().split(".");
      const oversNum = parseInt(o) || 0;
      const ballsNum = parseInt(b) || 0;
  
      if (ballsNum >= 6) return oversNum * 6; // safety
  
      return oversNum * 6 + ballsNum;
    };
  
    (scores || []).forEach((match) => {
      // ❌ Skip Final & Semifinal
      if (["Final", "Semifinal"].includes(match.matchType)) return;
  
      const team1 = match.scoringTeam;
      const team2 = match.chessingTeam;
  
      if (!team1 || !team2) return;
  
      const runs1 = match.inning1?.runs || 0;
      const runs2 = match.inning2?.runs || 0;
  
      // ✅ convert to balls
      const balls1 = convertToBalls(match.inning1?.overs);
      const balls2 = convertToBalls(match.inning2?.overs);
  
      const winner = match.winnerCard3?.includes("won")
        ? match.winnerCard3.split(" won")[0]
        : null;
  
      // 🔹 Init teams
      if (!table[team1]) {
        table[team1] = {
          team: team1,
          played: 0,
          win: 0,
          loss: 0,
          tie: 0,
          points: 0,
          runsScored: 0,
          runsConceded: 0,
          ballsFaced: 0,
          ballsBowled: 0,
        };
      }
  
      if (!table[team2]) {
        table[team2] = {
          team: team2,
          played: 0,
          win: 0,
          loss: 0,
          tie: 0,
          points: 0,
          runsScored: 0,
          runsConceded: 0,
          ballsFaced: 0,
          ballsBowled: 0,
        };
      }
  
      // ===============================
      // 🔹 SUPER OVER HANDLING
      // ===============================
      if (match.matchType === "SuperOver") {
        if (winner === team1 || winner === team2) {
          const winTeam = winner;
          const loseTeam = winner === team1 ? team2 : team1;
  
          if (table[team1].tie > 0 && table[team2].tie > 0) {
            table[team1].points -= 1;
            table[team2].points -= 1;
  
            table[team1].tie = 0;
            table[team2].tie = 0;
          }
  
          table[winTeam].win++;
          table[winTeam].points += 2;
          table[loseTeam].loss++;
        }
  
        return;
      }
  
      // ===============================
      // 🔹 NORMAL MATCH STATS
      // ===============================
      table[team1].played++;
      table[team2].played++;
  
      table[team1].runsScored += runs1;
      table[team1].runsConceded += runs2;
      table[team1].ballsFaced += balls1;
      table[team1].ballsBowled += balls2;
  
      table[team2].runsScored += runs2;
      table[team2].runsConceded += runs1;
      table[team2].ballsFaced += balls2;
      table[team2].ballsBowled += balls1;
  
      // ===============================
      // 🔹 RESULT LOGIC
      // ===============================
      if (runs1 === runs2) {
        if (table[team1].tie === 0 && table[team2].tie === 0) {
          table[team1].points += 1;
          table[team2].points += 1;
        }
  
        table[team1].tie++;
        table[team2].tie++;
      } else if (winner === team1) {
        table[team1].win++;
        table[team1].points += 2;
        table[team2].loss++;
      } else if (winner === team2) {
        table[team2].win++;
        table[team2].points += 2;
        table[team1].loss++;
      }
    });
  
    // ===============================
    // 🔹 FINAL TABLE (NRR using balls)
    // ===============================
    return Object.values(table)
      .map((t) => {
        const oversFaced = t.ballsFaced / 6;
        const oversBowled = t.ballsBowled / 6;
  
        const nrr =
          oversFaced > 0 && oversBowled > 0
            ? t.runsScored / oversFaced -
              t.runsConceded / oversBowled
            : 0;
  
        return {
          ...t,
          nrr: nrr.toFixed(2),
        };
      })
      .sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        return parseFloat(b.nrr) - parseFloat(a.nrr);
      });
  }, [scores]);
  
  const getBowlersForTable = ({ tableInning }) => {

      if (tableInning === 1) {
        return liveData?.inning1?.bowlers || [];
      }
      if (tableInning === 2) {
        return liveData?.inning2?.bowlers || [];
      }
 
    return [];
  };

  const EMPTY_EXTRAS = { total: 0, wide: 0, noBall: 0, Lb: 0 };

  const getExtrasForTable = ({ tableInning }) => {
    
      if (tableInning === 1) return liveData?.inning1?.extras || EMPTY_EXTRAS;
      if (tableInning === 2) return liveData?.inning2?.extras || EMPTY_EXTRAS;


 
    return EMPTY_EXTRAS;
  };



  return (
    <div className="container">

      {/* ================= HEADER ================= */}
      <AppBar position="fixed" className="appbar">
        <Toolbar>
          <Typography variant="h6">{info?.names}</Typography>
        </Toolbar>
      </AppBar>
      
      <div
        id="badge"
        className="badge badge-flex"
        style={{ marginTop: "64px" }}
      >
        <div></div>
        <div>Welcome to {info?.series}</div>
      <div></div>
      </div>

      {/* ================= TABS ================= */}
     
      {(!liveData || !matchData || !score) && (<div className="Imgdiv">
                <img
                  className="NoMatchLive"
                  src="/images/A3.png"
                  alt="No match available"
                />
              </div>)}

      { liveData && matchData && score && (
       <div>
       <div id="liveScore" className="tabs"> 
              <div className="score-container1">
                
               
                {/* Live Tag */}
                <div className="Tag">
                  <div className="First">
                    <div className="upcoming">
                      MATCH {liveData.matchId} 
                      {score.matchType && score.matchType !== "Normal"
                        ? ` - ${score.matchType}`
                        : ""}
                    </div>
                    <div className="Date">{score.date}</div>
                  </div>
                </div>

                {/* Scoring Team */}
                <div className="team-score1">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {score.scoringTeam}
                  </div>
                  <span className="score1">
                    {score.inning1.runs}-{score.inning1.wickets} (
                    {score.inning1.overs}/{score.maxOver})
                  </span>
                </div>

                {/* Chasing Team */}
                <div className="team-score1">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {score.chessingTeam}
                    <SportsCricketIcon style={{ marginLeft: "8px" }} />
                  </div>
                  <span className="score1">
                    {score.inning2.runs}-{score.inning2.wickets} (
                    {score.inning2.overs}/{score.maxOver})
                  </span>
                </div>

                <div className="line"></div>

                {/* Match Result */}
                <div className="result">{score.winnerCard3}</div>

                
              </div>
       </div>

       <div className="tabs">
        <button
          className={`tab ${activeTab === TABS.MATCH ? "active-tab" : ""}`}
          onClick={() => setTab(TABS.MATCH)}
        >
          Match
        </button>

        <button
          className={`tab ${activeTab === TABS.SCORE ? "active-tab" : ""}`}
          onClick={() => setTab(TABS.SCORE)}
        >
          Score
        </button>

        <button
          className={`tab ${activeTab === TABS.POINT ? "active-tab" : ""}`}
          onClick={() => setTab(TABS.POINT)}
        >
          Points
        </button>
       </div>
       </div>
       )
      }

      {/* ================= MATCH INFO ================= */}
      {activeTab === TABS.MATCH && matchData && (
        <div id="matchinfo">
         
                <div className="container1">
                  
                  <div className="info-container">
                    <table className="info-table">
                      <tbody>
                        <tr>
                          <td className="label1">Info</td>
                          <td className="label1"></td>
                        </tr>
                        <tr>
                          <td className="label">Match</td>
                          {/* <td className="value">{inningNo === 1 ? "1st" : "2nd"}</td> */}
                          <td className="value">
                             {matchData.team1} vs {matchData.team2}
                          </td>
                        </tr>
                        <tr>
                          <td className="label">Series</td>
                          <td className="value">
                            {info?.series}
                          </td>
                        </tr>
                        <tr>
                          <td className="label">Type</td>
                          <td className="value">
                            {info?.types}
                          </td>
                        </tr>
                        <tr>
                          <td className="label">Date</td>
                          <td className="value">{new Date(matchData.createdAt).toLocaleDateString("en-GB")}</td>
                        </tr>
                        <tr>
                          <td className="label">Time</td>
                          <td className="value">{new Date(matchData.createdAt).toLocaleTimeString()}</td>
                        </tr>
                        <tr>
                          <td className="label">Toss</td>
                          <td className="value">
                            {matchData.tossWinner} won & chose{" "}
                            {matchData.decision}
                          </td>
                        </tr>
                        <tr>
                          <td className="label1">Venue</td>
                          <td className="label1"></td>
                        </tr>
                        <tr>
                          <td className="label">Stadium</td>
                          <td className="value">
                            {venue?.stadium}
                          </td>
                        </tr>
                        <tr>
                          <td className="label">Location</td>
                          <td className="value">
                            {venue?.location}
                          </td>
                        </tr>
                        <tr>
                          <td className="label">Country</td>
                          <td className="value">
                            {venue?.country}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
      )}

      {/* ================= SCORE CARD ================= */}
      {activeTab === TABS.SCORE && liveData && (
         <div id="scoreCard">
              {/* Scorecard */}
              <div className="score-board-container">
              
                {/* Inning1 Starts here */}
                <div>
                  <div
                    className="score-board-innings"
                    onClick={(e) => {
                      toggleSlide1();
                    }}
                  >
                    <div>{score.scoringTeam} ( 1st Innings )</div>
                    {/* <div>
                      {inningNo === 1 ? totalRuns : inning1.runs}-
                      {inningNo === 1 ? wicketCount : inning1.wickets} (
                      {inningNo === 1 ? totalOvers : inning1.overs} Ov)
                    </div> */}
                     
                      <div>
                        {liveData.inning1.runs}
                        -
                        {liveData.inning1.wickets}{" "}
                        (
                        {liveData.inning1.overs}{" "}
                        Ov)
                      </div>
                    
                  </div>
                  {/* liveData.inningNo === 2 && */}
                  {isSlideOpen1 && (
                    <div className="sliding-panel">
                      {/* ================= INNING 1 BATTING ================= */}
                      <div className="sb-batting">
                        <table>
                          <thead>
                            <tr>
                              <td className="score-types padding-left">
                                <div className="sb">Batter</div>
                              </td>
                              <td className="score-types text-center data">
                                R
                              </td>
                              <td className="score-types text-center data">
                                B
                              </td>
                              <td className="score-types text-center data">
                                4s
                              </td>
                              <td className="score-types text-center data">
                                6s
                              </td>
                              <td className="score-types text-center data">
                                SR
                              </td>
                            </tr>
                          </thead>

                          <tbody>
                            {(() => {
                              let battersList = [];
                              let batterOne = null;
                              let batterTwo = null;

                            
                              /* ================= ADMIN ================= */
                                // Admin + Inning 1 → LOCAL
                               
                                // Admin + Inning 2 → SHOW NOTHING
                              
                                  battersList =
                                    liveData?.inning1?.batters || [];
                                  batterOne = liveData?.batter1;
                                  batterTwo = liveData?.batter2;
                                
                              

                              // if (!battersList.length) {
                              //   return (
                              //     <tr>
                              //       <td colSpan="6" style={{ textAlign: "center", opacity: 0.6 }}>
                              //         No batters yet
                              //       </td>
                              //     </tr>
                              //   );
                              // }

                              return battersList.map((batter, index) => {
                                const isOnGround =
                                  batter?.name === batterOne?.name ||
                                  batter?.name === batterTwo?.name;

                                const isStriker =
                                  (batter?.name === batterOne?.name &&
                                    batterOne?.onStrike) ||
                                  (batter?.name === batterTwo?.name &&
                                    batterTwo?.onStrike);

                                return (
                                  <tr
                                    key={`${batter.name}-${index}`}
                                    style={{
                                      fontWeight: isOnGround ? "700" : "400",
                                      color: isOnGround ? "green" : "inherit",
                                    }}
                                  >
                                    <td className="score-types padding-left">
                                      <div className="sb">
                                        {batter.name}
                                        {isStriker && " *"}
                                      </div>
                                    </td>
                                    <td className="score-types text-center data">
                                      {batter.run || 0}
                                    </td>
                                    <td className="score-types text-center data">
                                      {batter.ball || 0}
                                    </td>
                                    <td className="score-types text-center data">
                                      {batter.four || 0}
                                    </td>
                                    <td className="score-types text-center data">
                                      {batter.six || 0}
                                    </td>
                                    <td className="score-types text-center data">
                                      {batter.strikeRate || 0}
                                    </td>
                                  </tr>
                                );
                              });
                            })()}
                          </tbody>
                        </table>
                      </div>
                      {/* ================= BOWLING 1 ================= */}
                      <div className="sb-bowling">
                        <table>
                          <thead>
                            <tr>
                              <td className="score-types padding-left">
                                <div className="sb">Bowler</div>
                              </td>
                              <td className="score-types text-center data">
                                O
                              </td>
                              <td className="score-types text-center data">
                                M
                              </td>
                              <td className="score-types text-center data">
                                R
                              </td>
                              <td className="score-types text-center data">
                                W
                              </td>
                              <td className="score-types text-center data">
                                ECO
                              </td>
                            </tr>
                          </thead>
                          <tbody>
                            {getBowlersForTable({ tableInning: 1 }).map(
                              (blr, index) => {
                                

                                return (
                                  <tr
                                    key={`inning1-${blr.name}-${index}`}
                                   
                                  >
                                    <td className="score-types padding-left">
                                      {blr.name}
                                    </td>
                                    <td className="score-types text-center">
                                      {blr.over || 0}
                                    </td>
                                    <td className="score-types text-center">
                                      {blr.maiden || 0}
                                    </td>
                                    <td className="score-types text-center">
                                      {blr.run || 0}
                                    </td>
                                    <td className="score-types text-center">
                                      {blr.wicket || 0}
                                    </td>
                                    <td className="score-types text-center">
                                      {blr.economy || 0}
                                    </td>
                                  </tr>
                                );
                              },
                            )}
                          </tbody>
                        </table>
                      </div>
                      {/* Extra */}
                      {(() => {
                        const extras = getExtrasForTable({ tableInning: 1 });

                        return (
                          <div className="extras-container">
                            <div>Extras</div>
                            <div className="extra">
                              <div>Total: {extras.total}</div>
                              <div>Wd: {extras.wide}</div>
                              <div>Nb: {extras.noBall}</div>
                              <div>Lb: {extras.Lb}</div>
                              <div>B: {extras.Bye}</div>
                            </div>
                          </div>
                        );
                      })()}
                      {/* Run Rate – Inning 1 */}
                      <div className="extras-container">
                        <div>Run Rate</div>
                        <div className="extra">
                          <div>
                            {
                             liveData.inning1.runRate}
                          </div>
                        </div>
                      </div>
                      {/* Total */}
                      <div className="extras-container">
                        <div>Total</div>
                        <div className="extra">
                          {/* <div>
                            {inningNo === 1 ? totalRuns : inning1.runs}-
                            {inningNo === 1 ? wicketCount : inning1.wickets} (
                            {inningNo === 1 ? totalOvers : inning1.overs} Ov)
                          </div> */}
                          {
                            <div>
                              {liveData.inning1.runs}
                              -
                              {liveData.inning1.wickets}{" "}
                              (
                              {liveData.inning1.overs}{" "}
                              Ov)
                            </div>
                          }
                        </div>
                      </div>
                      {/* Recent Over */}
                      {/* <div className="recent-over-container">
                        <div className="recent-over-text">Recent Overs</div>
                        <div className="recent-over-details">
                          <table>
                            <thead className="Recent1">
                              <tr>
                                <th>Over</th>
                                <th>Bowler</th>
                                <th>Summary</th>
                                <th>Total</th>
                              </tr>
                            </thead>
                            <tbody className="Recent2">
                              {match.inning1.recentOvers.map(
                                (recentOver1, i) => (
                                  <tr key={i}>
                                    <td className="text-center">
                                      {recentOver1.overNo}
                                    </td>
                                    <td className="text-center">
                                      {recentOver1.bowler}
                                    </td>
                                    <td>
                                      <div className="recent-over-runs">
                                        {recentOver1.stack.map((run, index) => (
                                          <div key={index}>{run}</div>
                                        ))}
                                      </div>
                                    </td>
                                    <td className="recent-over-total-run">
                                      <div>{recentOver1.runs}</div>
                                    </td>
                                  </tr>
                                ),
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div> */}
                      {/* ================= INNING 1 : RECENT OVERS ================= */}
                      <div className="recent-over-container">
                        <div className="recent-over-text">
                          Recent Overs (Inning 1)
                        </div>

                        <div className="recent-over-details">
                          <table>
                            <thead className="Recent1">
                              <tr>
                                <th>Over</th>
                                <th>Bowler</th>
                                <th>Summary</th>
                                <th>Total</th>
                              </tr>
                            </thead>

                            <tbody className="Recent2">
                              {( liveData?.inning1?.recentOvers || []
                              ).map((over, i) => (
                                <tr key={i}>
                                  <td className="text-center">{over.overNo}</td>
                                  <td className="text-center">{over.bowler}</td>
                                  <td>
                                    <div className="recent-over-runs">
                                      {over.stack.map((run, index) => (
                                        <div key={index}>{run}</div>
                                      ))}
                                    </div>
                                  </td>
                                  <td className="recent-over-total-run">
                                    <div>{over.runs}</div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                {/* Inning2 Starts here */}
                <div>
                  <div
                    className="score-board-innings"
                    onClick={(e) => {
                      // handleLIVEscore();
                      toggleSlide2();
                    }}
                  >
                    <div>{score.chessingTeam} ( 2nd Innings )</div>
                    <div>
                   
                      { (
                        <div>
                          { `${ liveData.inning2.runs}-${
                                liveData.inning2.wickets 
                              } (${liveData.inning2.overs} Ov)`}
                        </div>
                      )}
                 
                    </div>
                  </div>
                  {/*  liveData.hasMatchEnded && */}
                  {isSlideOpen2 &&  (
                    <div className="sliding-panel">
                      {/* ================= INNING 1 BATTING ================= */}
                      <div className="sb-batting">
                        <table>
                          <thead>
                            <tr>
                              <td className="score-types padding-left">
                                <div className="sb">Batter</div>
                              </td>
                              <td className="score-types text-center data">
                                R
                              </td>
                              <td className="score-types text-center data">
                                B
                              </td>
                              <td className="score-types text-center data">
                                4s
                              </td>
                              <td className="score-types text-center data">
                                6s
                              </td>
                              <td className="score-types text-center data">
                                SR
                              </td>
                            </tr>
                          </thead>

                          <tbody>
                            {(() => {
                              let battersList = [];
                              let batterOne = null;
                              let batterTwo = null;

                            
                              /* ================= ADMIN ================= */
                                // Admin + Inning 1 → LOCAL
                               
                                // Admin + Inning 2 → SHOW NOTHING
                              
                                  battersList =
                                    liveData?.inning2?.batters || [];
                                  batterOne = liveData?.batter1;
                                  batterTwo = liveData?.batter2;
                                
                              

                              // if (!battersList.length) {
                              //   return (
                              //     <tr>
                              //       <td colSpan="6" style={{ textAlign: "center", opacity: 0.6 }}>
                              //         No batters yet
                              //       </td>
                              //     </tr>
                              //   );
                              // }

                              return battersList.map((batter, index) => {
                                const isOnGround =
                                  batter?.name === batterOne?.name ||
                                  batter?.name === batterTwo?.name;

                                const isStriker =
                                  (batter?.name === batterOne?.name &&
                                    batterOne?.onStrike) ||
                                  (batter?.name === batterTwo?.name &&
                                    batterTwo?.onStrike);

                                return (
                                  <tr
                                    key={`${batter.name}-${index}`}
                                    style={{
                                      fontWeight: isOnGround ? "700" : "400",
                                      color: isOnGround ? "green" : "inherit",
                                    }}
                                  >
                                    <td className="score-types padding-left">
                                      <div className="sb">
                                        {batter.name}
                                        {isStriker && " *"}
                                      </div>
                                    </td>
                                    <td className="score-types text-center data">
                                      {batter.run || 0}
                                    </td>
                                    <td className="score-types text-center data">
                                      {batter.ball || 0}
                                    </td>
                                    <td className="score-types text-center data">
                                      {batter.four || 0}
                                    </td>
                                    <td className="score-types text-center data">
                                      {batter.six || 0}
                                    </td>
                                    <td className="score-types text-center data">
                                      {batter.strikeRate || 0}
                                    </td>
                                  </tr>
                                );
                              });
                            })()}
                          </tbody>
                        </table>
                      </div>
                      {/* ================= BOWLING 1 ================= */}
                      <div className="sb-bowling">
                        <table>
                          <thead>
                            <tr>
                              <td className="score-types padding-left">
                                <div className="sb">Bowler</div>
                              </td>
                              <td className="score-types text-center data">
                                O
                              </td>
                              <td className="score-types text-center data">
                                M
                              </td>
                              <td className="score-types text-center data">
                                R
                              </td>
                              <td className="score-types text-center data">
                                W
                              </td>
                              <td className="score-types text-center data">
                                ECO
                              </td>
                            </tr>
                          </thead>
                          <tbody>
                            {getBowlersForTable({ tableInning: 2 }).map(
                              (blr, index) => {
                                

                                return (
                                  <tr
                                    key={`inning1-${blr.name}-${index}`}
                                   
                                  >
                                    <td className="score-types padding-left">
                                      {blr.name}
                                    </td>
                                    <td className="score-types text-center">
                                      {blr.over || 0}
                                    </td>
                                    <td className="score-types text-center">
                                      {blr.maiden || 0}
                                    </td>
                                    <td className="score-types text-center">
                                      {blr.run || 0}
                                    </td>
                                    <td className="score-types text-center">
                                      {blr.wicket || 0}
                                    </td>
                                    <td className="score-types text-center">
                                      {blr.economy || 0}
                                    </td>
                                  </tr>
                                );
                              },
                            )}
                          </tbody>
                        </table>
                      </div>
                      {/* Extra */}
                      {(() => {
                        const extras = getExtrasForTable({ tableInning: 2 });

                        return (
                          <div className="extras-container">
                            <div>Extras</div>
                            <div className="extra">
                              <div>Total: {extras.total}</div>
                              <div>Wd: {extras.wide}</div>
                              <div>Nb: {extras.noBall}</div>
                              <div>Lb: {extras.Lb}</div>
                              <div>B: {extras.Bye}</div>
                            </div>
                          </div>
                        );
                      })()}
                      {/* Run Rate – Inning 1 */}
                      <div className="extras-container">
                        <div>Run Rate</div>
                        <div className="extra">
                          <div>
                            {
                             liveData.inning2.runRate}
                          </div>
                        </div>
                      </div>
                      {/* Total */}
                      <div className="extras-container">
                        <div>Total</div>
                        <div className="extra">
                          {/* <div>
                            {inningNo === 1 ? totalRuns : inning1.runs}-
                            {inningNo === 1 ? wicketCount : inning1.wickets} (
                            {inningNo === 1 ? totalOvers : inning1.overs} Ov)
                          </div> */}
                          {
                            <div>
                              {liveData.inning2.runs}
                              -
                              {liveData.inning2.wickets}{" "}
                              (
                              {liveData.inning2.overs}{" "}
                              Ov)
                            </div>
                          }
                        </div>
                      </div>
                      {/* Recent Over */}
                      {/* <div className="recent-over-container">
                        <div className="recent-over-text">Recent Overs</div>
                        <div className="recent-over-details">
                          <table>
                            <thead className="Recent1">
                              <tr>
                                <th>Over</th>
                                <th>Bowler</th>
                                <th>Summary</th>
                                <th>Total</th>
                              </tr>
                            </thead>
                            <tbody className="Recent2">
                              {match.inning1.recentOvers.map(
                                (recentOver1, i) => (
                                  <tr key={i}>
                                    <td className="text-center">
                                      {recentOver1.overNo}
                                    </td>
                                    <td className="text-center">
                                      {recentOver1.bowler}
                                    </td>
                                    <td>
                                      <div className="recent-over-runs">
                                        {recentOver1.stack.map((run, index) => (
                                          <div key={index}>{run}</div>
                                        ))}
                                      </div>
                                    </td>
                                    <td className="recent-over-total-run">
                                      <div>{recentOver1.runs}</div>
                                    </td>
                                  </tr>
                                ),
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div> */}
                      {/* ================= INNING 1 : RECENT OVERS ================= */}
                      <div className="recent-over-container">
                        <div className="recent-over-text">
                          Recent Overs (Inning 2)
                        </div>

                        <div className="recent-over-details">
                          <table>
                            <thead className="Recent1">
                              <tr>
                                <th>Over</th>
                                <th>Bowler</th>
                                <th>Summary</th>
                                <th>Total</th>
                              </tr>
                            </thead>

                            <tbody className="Recent2">
                              {( liveData?.inning2?.recentOvers || []
                              ).map((over, i) => (
                                <tr key={i}>
                                  <td className="text-center">{over.overNo}</td>
                                  <td className="text-center">{over.bowler}</td>
                                  <td>
                                    <div className="recent-over-runs">
                                      {over.stack.map((run, index) => (
                                        <div key={index}>{run}</div>
                                      ))}
                                    </div>
                                  </td>
                                  <td className="recent-over-total-run">
                                    <div>{over.runs}</div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
      )}

      {activeTab === TABS.POINT && scores && pointsTable?.length > 0 && (
       <div className="sb-batting">
              <table>
                <thead>
                  <tr>
                    <td className="score-types padding-left">
                      <div className="sb">Team</div>
                    </td>
                    <td className="score-types text-center data">M</td>
                    <td className="score-types text-center data">W</td>
                    <td className="score-types text-center data">L</td>
                    <td className="score-types text-center data">T</td>
                    <td className="score-types text-center data">Pts</td>
                    <td className="score-types text-center data">NRR</td>
                  </tr>
                </thead>

                <tbody>
                  {pointsTable.map((team, index) => (
                    <tr key={index}>
                      <td className="score-types padding-left">
                        <div className="sb">{team.team}</div>
                      </td>

                      <td className="score-types text-center data">
                        {team.played}
                      </td>
                      <td className="score-types text-center data">
                        {team.win}
                      </td>
                      <td className="score-types text-center data">
                        {team.loss}
                      </td>
                      <td className="score-types text-center data">
                        {team.tie}
                      </td>
                      <td className="score-types text-center data">
                        {team.points}
                      </td>
                      <td className="score-types text-center data">
                        {team.nrr}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
      )}
    </div>
  );
};

export default Scorecard;