// Working
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { AppBar, Toolbar, Typography } from "@material-ui/core";
import EditIcon from "@mui/icons-material/Edit";
import { IconButton } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { pink } from "@mui/material/colors";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import Modal from "@mui/material/Modal";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import Autosuggest from "react-autosuggest";
import { BATTING, OUT } from "../constants/BattingStatus";
import {
  BOLD,
  CATCH,
  HIT_WICKET,
  OUT_OF_GROUND,
  RUN_OUT,
  STUMP,
} from "../constants/OutType";
import MathUtil from "../util/MathUtil";
import { buildSecondInningsNoticeMessage } from "../util/buildSecondInningsNoticeMessage";
import {
  isWicketStackEntry,
  wicketTokenBreaksMaiden,
} from "../util/wicketStackToken";
import "./ScoreBoard.css";
import { radioGroupBoxstyle } from "./ui/RadioGroupBoxStyle";
import SportsCricketIcon from "@mui/icons-material/SportsCricket"; // Import the icon
import { FaTrash, FaEye} from "react-icons/fa"; // Using react-icons for delete icon
import Stars from "../components/LeaderBoard/Stars";

const createEmptyMatchState = () => ({
  inning1: {
    runs: 0,
    wickets: 0,
    overs: 0,
    batters: [],
    bowlers: [],
    extras: {},
    recentOvers: [],
  },
  inning2: {
    runs: 0,
    wickets: 0,
    overs: 0,
    batters: [],
    bowlers: [],
    extras: {},
    recentOvers: [],
  },
  bowler: {
    id: "",
    name: "",
    over: 0,
    maiden: 0,
    run: 0,
    wicket: 0,
    economy: 0,
  },
  bowlers: [],
});

const SCOREBOARD_STORAGE_KEYS = [
  "match",
  "inningNo",
  "totalRuns",
  "wicketCount",
  "TotalWicket",
  "totalOvers",
  "ballCount",
  "isBatter1Edited",
  "isBatter2Edited",
  "isBowlerEdited",
  "batter1SaveConfirmed",
  "batter2SaveConfirmed",
  "bowlerSaveConfirmed",
  "batter1",
  "batter2",
  "batters",
  "strikeValue",
  "bowler",
  "inputBowler",
  "currentRunStack",
  "extras",
  "recentOvers",
  "recentOvers1",
  "bowlers",
  "overCount",
  "runsByOver",
  "remainingBalls",
  "remainingRuns",
  "activeSection",
  "battingOrder",
  "isModalOpen",
  "runOutPlayerId",
  "runOutCompletedRuns",
  "hasMatchEnded",
  "isNoBall",
  "iswideball",
  "isLb",
  "isBye",
  "overthrowMode",
  "overthrowBaseRun",
  "outType",
  "buttonstate",
  "reset",
  "runrate",
];

// 
const ScoreBoard = (props) => {
  const navigate = useNavigate();
  const getStoredData = (key, defaultValue) => {
    const storedValue = localStorage.getItem(key);
    if (storedValue == null || storedValue === "") return defaultValue;
    try {
      return JSON.parse(storedValue);
    } catch {
      return defaultValue;
    }
  };
  const [inningNo, setInningNo] = useState(getStoredData("inningNo", 1));
  const [totalRuns, setTotalRuns] = useState(getStoredData("totalRuns", 0));
  const [wicketCount, setWicketCount] = useState(
    getStoredData("wicketCount", 0),
  );

  const [TotalWicket, setTotalWicket] = useState(
    getStoredData("wicketCount", 0),
  );

  const [totalOvers, setTotalOvers] = useState(getStoredData("totalOvers", 0));
  const [ballCount, setBallCount] = useState(getStoredData("ballCount", 0));
  const [match, setMatch] = useState(
    getStoredData("match", {
      inning1: {
        runs: 0,
        wickets: 0,
        overs: 0,
        batters: [],
        bowlers: [],
        extras: {},
        recentOvers: [],
      },
      inning2: {
        runs: 0,
        wickets: 0,
        overs: 0,
        batters: [],
        bowlers: [],
        extras: {},
        recentOvers: [],
      },

      // ✅ ROOT-LEVEL CURRENT BOWLER
      bowler: {
        id: "",
        name: "",
        over: 0,
        maiden: 0,
        run: 0,
        wicket: 0,
        economy: 0,
      },

      // ✅ ROOT-LEVEL ALL BOWLERS
      bowlers: [],
    }),
  );
  const [isBatter1Edited, setBatter1Edited] = useState(
    getStoredData("isBatter1Edited", false),
  );
  const [isBatter2Edited, setBatter2Edited] = useState(
    getStoredData("isBatter2Edited", false),
  );
  const [isBowlerEdited, setBowlerEdited] = useState(
    getStoredData("isBowlerEdited", false),
  );
  const [batter1, setBatter1] = useState(getStoredData("batter1", {}));
  const [batter2, setBatter2] = useState(getStoredData("batter2", {}));
  const [batters, setBatters] = useState(getStoredData("batters", []));
  const [strikeValue, setStrikeValue] = useState(
    getStoredData("strikeValue", "strike"),
  );
  const [bowler, setBowler] = useState(getStoredData("bowler", {}));
  const [bowlers, setBowlers] = useState(getStoredData("bowlers", []));
  const [overCount, setOverCount] = useState(getStoredData("overCount", 0));
  const [inputBowler, setInputBowler] = useState(() => {
    const v = getStoredData("inputBowler", "");
    return v == null ? "" : String(v);
  });
  const [currentRunStack, setCurrentRunStack] = useState(
    getStoredData("currentRunStack", []),
  );
  const [extras, setExtras] = useState(
    getStoredData("extras", { total: 0, wide: 0, noBall: 0, Lb: 0, Bye: 0 }),
  );
  const [recentOvers, setRecentOvers] = useState(
    getStoredData("recentOvers", []),
  );
  const [recentOvers1, setRecentOvers1] = useState(
    getStoredData("recentOvers1", []),
  );
  const [runsByOver, setRunsByOver] = useState(getStoredData("runsByOver", 0));
  const [remainingBalls, setRemainingBalls] = useState(
    getStoredData("remainingBalls", 0),
  );
  const [remainingRuns, setRemainingRuns] = useState(
    getStoredData("remainingRuns", 0),
  );
  const [activeSection, setActiveSection] = useState(
    getStoredData("activeSection", "matchInfo"),
  );
  const [battingOrder, setBattingOrder] = useState(
    getStoredData("battingOrder", 0),
  );
  const [runrate, setRunrate] = useState(getStoredData("runrate", 0));
  const [isModalOpen, setModalOpen] = useState(
    getStoredData("isModalOpen", false),
  );
  const [runOutPlayerId, setRunOutPlayerId] = useState(
    getStoredData("runOutPlayerId", ""),
  );
  const [runOutCompletedRuns, setRunOutCompletedRuns] = useState(
    getStoredData("runOutCompletedRuns", 0),
  );
  const [hasMatchEnded, setMatchEnded] = useState(
    getStoredData("hasMatchEnded", false),
  );
  const [isNoBall, setNoBall] = useState(getStoredData("isNoBall", false));
  const [iswideball, setwideBall] = useState(
    getStoredData("iswideball", false),
  );
  const [isLb, setLb] = useState(getStoredData("isLb", false));
  const [isBye, setBye] = useState(getStoredData("isBye", false));
  const [outType, setOutType] = useState(getStoredData("outType", ""));
  const wicketModalOkEnabled =
    outType !== "" &&
    (outType !== RUN_OUT || runOutPlayerId !== "");
  const [buttonstate, setButtonstate] = useState(
    getStoredData("buttonstate", false),
  );
  const [reset, setreset] = useState(getStoredData("reset", true));
  const [scores, setScores] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [hasNameSuggested, setNameSuggested] = useState(false);
  const [isSlideOpen1, setIsSlideOpen1] = useState(false);
  const [isSlideOpen2, setIsSlideOpen2] = useState(false);
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [matchData, setMatchData] = useState(null);
  const [liveData, setLiveData] = useState(null);
  const [info, setInfo] = useState(null);
  const [venue, setVenue] = useState(null);

  const [endInningButtonLabelOverride, setEndInningButtonLabelOverride] =
    useState(null);
  /** Persisted save flags + names keep Save button color/lock state consistent across refresh. */
  const [batter1SaveConfirmed, setBatter1SaveConfirmed] = useState(() =>
    getStoredData("batter1SaveConfirmed", false) === true,
  );
  const [batter2SaveConfirmed, setBatter2SaveConfirmed] = useState(() =>
    getStoredData("batter2SaveConfirmed", false) === true,
  );
  const [bowlerSaveConfirmed, setBowlerSaveConfirmed] = useState(() =>
    getStoredData("bowlerSaveConfirmed", false) === true,
  );
  const [batter1InputDisabled, setBatter1InputDisabled] = useState(() => {
    const saved = getStoredData("batter1SaveConfirmed", false) === true;
    const b = getStoredData("batter1", {});
    const n = String(b?.name ?? "").trim();
    return saved && n !== "";
  });
  const [batter2InputDisabled, setBatter2InputDisabled] = useState(() => {
    const saved = getStoredData("batter2SaveConfirmed", false) === true;
    const b = getStoredData("batter2", {});
    const n = String(b?.name ?? "").trim();
    return saved && n !== "";
  });
  const [bowlerInputDisabled, setBowlerInputDisabled] = useState(() => {
    const saved = getStoredData("bowlerSaveConfirmed", false) === true;
    const b = getStoredData("bowler", {});
    const inp = getStoredData("inputBowler", "");
    const bn = String(b?.name ?? "").trim();
    const it = String(inp ?? "").trim();
    if (!saved) return false;
    return bn !== "" && it !== "" && bn === it && Boolean(b?.id);
  });
  const [runOutPlayerUiVisible, setRunOutPlayerUiVisible] = useState(false);
  const [runOutPlayerErrorVisible, setRunOutPlayerErrorVisible] =
    useState(false);
  const [keypadAllDisabled, setKeypadAllDisabled] = useState(false);
  const [keypadActiveDisabled, setKeypadActiveDisabled] = useState(
    getStoredData("isNoBall", false) === true,
  );
  const [keypadActive1Disabled, setKeypadActive1Disabled] = useState(() => {
    const w = getStoredData("iswideball", false) === true;
    const l = getStoredData("isLb", false) === true;
    const b = getStoredData("isBye", false) === true;
    return w || l || b;
  });
  const [noBallVisualOnInactive, setNoBallVisualOnInactive] = useState(
    getStoredData("isNoBall", false) === true,
  );
  const [wideLbVisualOnInactive1, setWideLbVisualOnInactive1] = useState(() => {
    const w = getStoredData("iswideball", false) === true;
    const l = getStoredData("isLb", false) === true;
    const b = getStoredData("isBye", false) === true;
    return w || l || b;
  });
  const [overthrowMode, setOverthrowMode] = useState(
    getStoredData("overthrowMode", null),
  );
  const [overthrowBaseRun, setOverthrowBaseRun] = useState(
    getStoredData("overthrowBaseRun", null),
  );
  /**
   * Same conditions as the three green Save buttons + commit flags (must match player-field-save--ok).
   */
  const keypadBaseReady = useMemo(() => {
    const batter1SaveUiOk =
      batter1InputDisabled && String(batter1?.name ?? "").trim() !== "";
    const batter2SaveUiOk =
      batter2InputDisabled && String(batter2?.name ?? "").trim() !== "";
    const bowlerSaveUiOk =
      bowlerInputDisabled &&
      Boolean(bowler?.id) &&
      String(inputBowler ?? "").trim() !== "";
    return (
      batter1SaveConfirmed &&
      batter2SaveConfirmed &&
      bowlerSaveConfirmed &&
      batter1SaveUiOk &&
      batter2SaveUiOk &&
      bowlerSaveUiOk
    );
  }, [
    batter1SaveConfirmed,
    batter2SaveConfirmed,
    bowlerSaveConfirmed,
    batter1InputDisabled,
    batter2InputDisabled,
    bowlerInputDisabled,
    batter1?.name,
    batter2?.name,
    bowler?.id,
    inputBowler,
  ]);
  /** When chase result is decided (2nd innings), blocks keypad unlock from the names effect. */
  const chaseResultKeypadLockedRef = useRef(false);

  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState("");

  useEffect(() => {
    if (!batter1?.name?.trim?.()) {
      setBatter1InputDisabled((d) => (d ? false : d));
    }
  }, [batter1?.name]);

  useEffect(() => {
    if (!batter2?.name?.trim?.()) {
      setBatter2InputDisabled((d) => (d ? false : d));
    }
  }, [batter2?.name]);

  useEffect(() => {
    const bn = bowler?.name?.trim?.();
    const inp = inputBowler?.trim?.();
    if (!bn && !inp) {
      setBowlerInputDisabled((d) => (d ? false : d));
    } else if (bn && inp && bn !== inp) {
      setBowlerInputDisabled((d) => (d ? false : d));
    }
  }, [bowler?.name, inputBowler]);

  /** Live API snapshot (RRR/CRR/winning message) — used for viewers + scorecard polling. */
  const fetchLiveSnapshot = useCallback(async () => {
    try {
      const countRes = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/live/count`,
      );
      if (!countRes.ok) return;

      const countData = await countRes.json();
      const count = countData.count || 0;
      if (count === 0) return;

      const matchRes = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/live/match/${count}`,
      );
      const match = matchRes.data;

      const overCount = match.overCount || 0;
      const ballCount = match.ballCount || 0;
      const totalRuns = match.totalRuns || 0;
      const remainingRuns = match.remainingRuns || 0;
      const remainingBalls = match.remainingBalls || 0;
      const wicketCount = match.wicketCount || 0;
      const maxOver = match.totalOvers || 0;
      const inningNo = match.inningNo;
      const inning1 = match.inning1 || {};
      const team1 = match.scoringTeam;
      const team2 = match.chessingTeam;

      const scoringTeam = team1;
      const chessingTeam = team2;

      let target = inning1.runs ? inning1.runs + 1 : 0;

      const chaseSealedForRrr =
        inningNo === 2 &&
        (!!match.hasMatchEnded ||
          remainingRuns <= 0 ||
          (inning1.runs != null && totalRuns >= inning1.runs + 1));
      let rrr = chaseSealedForRrr
        ? "0.00"
        : (remainingRuns / (remainingBalls / 6)).toFixed(2);
      rrr = isFinite(rrr) ? rrr : 0;

      const overs = overCount + ballCount / 6;
      let crr = (totalRuns / overs).toFixed(2);
      crr = isFinite(crr) ? crr : 0;

      const winningMessage = buildSecondInningsNoticeMessage({
        inningNo,
        inning1: match.inning1,
        inning2: match.inning2,
        maxOver,
        totalWicket: TotalWicket,
        scoringTeam,
        chessingTeam,
        totalRuns,
        wicketCount,
        overCount,
        hasMatchEnded: !!match.hasMatchEnded,
        remainingRuns,
        remainingBalls,
      });
      setRunrate(crr);
      setLiveData({
        ...match,
        rrr,
        crr,
        winningMessage,
        target,
      });
    } catch (err) {
      console.error("Failed to load match data:", err.message);
    }
  }, [TotalWicket]);

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

  /** Enrich live snapshot whenever total wickets setting changes. */
  useEffect(() => {
    fetchLiveSnapshot();
  }, [fetchLiveSnapshot]);

  /** Viewers: poll live API so Score Card updates without full page reload. */
  useEffect(() => {
    if (props.Admin || !props.newMatch) return;
    const id = setInterval(() => {
      fetchLiveSnapshot();
    }, 4000);
    return () => clearInterval(id);
  }, [props.Admin, props.newMatch, fetchLiveSnapshot]);

  // View Result
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
  // Local Storage
  useEffect(() => {
    // localStorage.setItem("Admin", JSON.stringify(Admin));
    localStorage.setItem("match", JSON.stringify(match));
    localStorage.setItem("inningNo", JSON.stringify(inningNo));
    localStorage.setItem("totalRuns", JSON.stringify(totalRuns));
    localStorage.setItem("wicketCount", JSON.stringify(wicketCount));
    localStorage.setItem("TotalWicket", JSON.stringify(TotalWicket));
    localStorage.setItem("totalOvers", JSON.stringify(totalOvers));
    localStorage.setItem("ballCount", JSON.stringify(ballCount));
    localStorage.setItem("isBatter1Edited", JSON.stringify(isBatter1Edited));
    localStorage.setItem("isBatter2Edited", JSON.stringify(isBatter2Edited));
    localStorage.setItem("isBowlerEdited", JSON.stringify(isBowlerEdited));
    localStorage.setItem(
      "batter1SaveConfirmed",
      JSON.stringify(batter1SaveConfirmed),
    );
    localStorage.setItem(
      "batter2SaveConfirmed",
      JSON.stringify(batter2SaveConfirmed),
    );
    localStorage.setItem(
      "bowlerSaveConfirmed",
      JSON.stringify(bowlerSaveConfirmed),
    );
    localStorage.setItem("batter1", JSON.stringify(batter1));
    localStorage.setItem("batter2", JSON.stringify(batter2));
    localStorage.setItem("batters", JSON.stringify(batters));
    localStorage.setItem("strikeValue", JSON.stringify(strikeValue));
    localStorage.setItem("bowler", JSON.stringify(bowler));
    localStorage.setItem("inputBowler", JSON.stringify(inputBowler));
    localStorage.setItem("currentRunStack", JSON.stringify(currentRunStack));
    localStorage.setItem("extras", JSON.stringify(extras));
    localStorage.setItem("recentOvers", JSON.stringify(recentOvers));
    localStorage.setItem("recentOvers1", JSON.stringify(recentOvers1));
    localStorage.setItem("bowlers", JSON.stringify(bowlers));
    localStorage.setItem("overCount", JSON.stringify(overCount));
    localStorage.setItem("runsByOver", JSON.stringify(runsByOver));
    localStorage.setItem("remainingBalls", JSON.stringify(remainingBalls));
    localStorage.setItem("remainingRuns", JSON.stringify(remainingRuns));
    localStorage.setItem("activeSection", JSON.stringify(activeSection));
    localStorage.setItem("battingOrder", JSON.stringify(battingOrder));
    localStorage.setItem("isModalOpen", JSON.stringify(isModalOpen));
    localStorage.setItem("runOutPlayerId", JSON.stringify(runOutPlayerId));
    localStorage.setItem(
      "runOutCompletedRuns",
      JSON.stringify(runOutCompletedRuns),
    );
    localStorage.setItem("hasMatchEnded", JSON.stringify(hasMatchEnded));
    localStorage.setItem("isNoBall", JSON.stringify(isNoBall));
    localStorage.setItem("iswideball", JSON.stringify(iswideball));
    localStorage.setItem("isLb", JSON.stringify(isLb));
    localStorage.setItem("isBye", JSON.stringify(isBye));
    localStorage.setItem("overthrowMode", JSON.stringify(overthrowMode));
    localStorage.setItem("overthrowBaseRun", JSON.stringify(overthrowBaseRun));
    localStorage.setItem("outType", JSON.stringify(outType));
    localStorage.setItem("buttonstate", JSON.stringify(buttonstate));
    localStorage.setItem("reset", JSON.stringify(reset));
    localStorage.setItem("runrate", JSON.stringify(runrate));
  }, [
    match,
    inningNo,
    totalRuns,
    wicketCount,
    TotalWicket,
    totalOvers,
    ballCount,
    isBowlerEdited,
    isBatter2Edited,
    isBatter1Edited,
    batter1SaveConfirmed,
    batter2SaveConfirmed,
    bowlerSaveConfirmed,
    batter2,
    batter1,
    strikeValue,
    bowler,
    inputBowler,
    currentRunStack,
    extras,
    recentOvers,
    recentOvers1,
    bowlers,
    overCount,
    batters,
    runsByOver,
    remainingBalls,
    remainingRuns,
    activeSection,
    battingOrder,
    isModalOpen,
    runOutPlayerId,
    runOutCompletedRuns,
    hasMatchEnded,
    isNoBall,
    iswideball,
    isLb,
    isBye,
    overthrowMode,
    overthrowBaseRun,
    outType,
    buttonstate,
    reset,
    runrate,
  ]);

  // New Match
  const { setNewMatch } = props;

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/matches`,
        );
        const data = await response.json();

        if (data.length === 0) return;

        const latestMatch = data[data.length - 1];

        setMatchData(latestMatch);
        console.log(`Total number of wicket ${latestMatch.players}`);

        setTotalWicket(latestMatch.players);

        if (latestMatch.newmatch !== undefined) {
          setNewMatch(latestMatch.newmatch);
        }

        const battingTeam =
          latestMatch.decision === "bat"
            ? latestMatch.tossWinner
            : latestMatch.tossWinner === latestMatch.team1
              ? latestMatch.team2
              : latestMatch.team1;

        localStorage.setItem(
          "data",
          JSON.stringify({
            maxOver: latestMatch.maxOver || 20,
            team1: latestMatch.team1 || "Team A",
            team2: latestMatch.team2 || "Team B",
            batting: battingTeam || "Team A",
          }),
        );
      } catch (error) {
        console.error("Error fetching match data:", error);
      }
    };

    fetchMatch();
  }, [setNewMatch]);

  const data = JSON.parse(localStorage.getItem("data")) || {};
  const { batting = "", team1 = "", team2 = "" } = data;
  const maxOver = parseInt(data.maxOver || "20");

  // if (!localStorage.getItem("data")) {
  //   localStorage.setItem(
  //     "data",
  //     JSON.stringify({
  //       maxOver: 20,
  //       team1: "Team A",
  //       team2: "Team B",
  //       batting: "Team A",
  //     })
  //   );
  // }

  // let data = JSON.parse(localStorage.getItem("data"));
  // const { batting, team1, team2 } = data;
  // const maxOver = parseInt(data.maxOver);

  // UI State
  const toggleSlide1 = () => {
    setIsSlideOpen1(!isSlideOpen1); // Toggle the slide state
  };
  const toggleSlide2 = () => {
    setIsSlideOpen2(!isSlideOpen2); // Toggle the slide state
  };

  useEffect(() => {
    // maintain state
    if (inningNo === 2) {
      if (
        remainingRuns <= 0 ||
        overCount === maxOver ||
        wicketCount === TotalWicket
      ) {
        setButtonstate(true);
      } else {
        setButtonstate(false);
      }
    } else {
      if (overCount === maxOver || wicketCount === TotalWicket) {
        setButtonstate(true);
      } else {
        setButtonstate(false);
      }
    }
  }, [inningNo, overCount, maxOver, wicketCount, TotalWicket, remainingRuns]);

  // Useless
  // useEffect(() => {
  //   // console.log(matchData)
  //   console.log("Props received in ScoreBoard:", props);
  // }, [props]);

  // Time
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const formattedDate = now.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      const formattedTime = now.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      });
      setCurrentDate(formattedDate);
      setCurrentTime(formattedTime);
    };

    updateDateTime();
    const intervalId = setInterval(updateDateTime, 60000); // Update every minute

    return () => clearInterval(intervalId); // Cleanup
  }, []);

  // Real Time Update

  //   useEffect(() => {
  //   if (!props.newMatch) return;
  //   const interval = setInterval(() => {
  //     updateLiveMatch();
  //     handleLIVEscore();
  //   }, 3000); // every 3 seconds

  //   return () => clearInterval(interval);
  // }, [props.newMatch]);

  //  useEffect(() => {
  //     if (props.newMatch) {
  //       updateLiveMatch();
  //       handleLIVEscore();
  //     }
  //   }, [
  //     match
  //   ]);

  // useEffect(() => { if (props.newMatch) { updateLiveMatch(); handleLIVEscore(); } }, [ inningNo, totalRuns, wicketCount, totalOvers, overCount, ballCount, hasMatchEnded, remainingRuns, remainingBalls, batter1, batter2, bowler, bowlers, extras, recentOvers, match, ]);

  // const { newMatch } = props;

  // useEffect(() => {
  //   if (!newMatch) return;

  //   const interval = setInterval(() => {
  //     updateLiveMatch();
  //     handleLIVEscore();
  //   }, 3000);

  //   return () => clearInterval(interval);
  // }, [newMatch, updateLiveMatch, handleLIVEscore]);

  const formatRunToken = useCallback((run) => {
    if (typeof run === "number") return String(run);
    const t = String(run);
    if (t === "W") return "W";
    if (/^W\+\d+$/.test(t)) return `${parseInt(t.slice(2), 10) || 0}W`;
    if (t === "nb") return "NB";
    if (/^nb\d+$/.test(t)) return `NB+${parseInt(t.slice(2), 10) || 0}`;
    if (t === "nb+W" || t === "nbW") return "NB+W";
    if (/^nbW\+\d+$/.test(t))
      return `NB+${parseInt(t.slice(4), 10) || 0}W`;
    if (t === "wd") return "WD";
    if (/^wd\d+$/.test(t)) return `WD+${parseInt(t.slice(2), 10) || 0}`;
    if (t === "wdW") return "WD+W";
    if (/^wdW\+\d+$/.test(t))
      return `WD+${parseInt(t.slice(4), 10) || 0}W`;
    if (t === "LbW") return "LBW";
    if (/^LbW\+\d+$/.test(t))
      return `LB${parseInt(t.slice(4), 10) || 0}W`;
    if (t === "ByW") return "BW";
    if (/^ByW\+\d+$/.test(t))
      return `B${parseInt(t.slice(4), 10) || 0}W`;
    if (/^Lb\d+$/.test(t)) return `LB${parseInt(t.slice(2), 10) || 0}`;
    if (/^By\d+$/.test(t)) return `B${parseInt(t.slice(2), 10) || 0}`;
    if (/^ov:\d+:\d+$/.test(t)) {
      const [, before = "0", after = "0"] = t.split(":");
      return `${before}+OT${after}`;
    }
    if (/^ovw:\d+:\d+$/.test(t)) {
      const [, before = "0", after = "0"] = t.split(":");
      return `${before}W+OT${after}`;
    }
    return run;
  }, []);

  const mapRecentOversForDb = useCallback((overs) => {
    if (!Array.isArray(overs)) return [];
  
    return overs.map((ov) => ({
      ...ov,
      stack: Array.isArray(ov?.stack)
        ? ov.stack.map((token) => formatRunToken(token))
        : [],
    }));
  }, [formatRunToken]);

  const createLiveMatch = async ({
    inningNo,
    totalRuns,
    wicketCount,
    totalOvers,
    overCount,
    ballCount,
    hasMatchEnded,
    remainingRuns,
    remainingBalls,
    match,
    batter1,
    batter2,
    bowler,
    bowlers,
    extras,
    recentOvers,
  }) => {
    try {
      const countRes = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/live/count`,
      );
      const matchCount = countRes.data.count;
      const newMatchId = matchCount + 1; // 👈 Keep as Number, not string

      const emptyLive = createEmptyMatchState();
      const recentOversForDb = mapRecentOversForDb(recentOvers);
      const payload = {
        matchId: newMatchId, // 👈 Numeric ID
        inningNo: 1,
        totalRuns: 0,
        wicketCount: 0,
        totalOvers: 0,
        overCount: 0,
        ballCount: 0,
        hasMatchEnded: false,
        remainingRuns: 0,
        remainingBalls: 0,
        scoringTeam: "Team A",
        chessingTeam: "Team B",
        inning1: emptyLive.inning1,
        inning2: emptyLive.inning2,
        batter1,
        batter2,
        bowler,
        bowlers,
        extras,
        recentOvers: recentOversForDb,
        admin: true,
      };

      const res = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/live/create`,
        payload,
      );
      console.log("Live match created successfully:", res.data);
    } catch (err) {
      console.error("Error creating live match:", err);
    }
  };

  ////////////

  // const updateLiveMatch = async () => {
  //   try {
  //     // Step 1: Get the current count of live matches
  //     const countRes = await fetch(
  //       `${process.env.REACT_APP_API_BASE_URL}/live/count`,
  //     );

  //     if (!countRes.ok) {
  //       console.error(
  //         `Failed to fetch match count: ${countRes.status} ${countRes.statusText}`,
  //       );
  //       return;
  //     }

  //     const countData = await countRes.json();
  //     const count = countData.count || 0;

  //     if (count === 0) {
  //       console.warn("No live match entries found. Skipping update.");
  //       return;
  //     }

  //     // Use count as the matchId
  //     const matchId = parseInt(count, 10);

  //     if (isNaN(matchId)) {
  //       console.warn("Invalid match ID derived from count:", count);
  //       return;
  //     }

  //     const updatePayload = {
  //       inningNo,
  //       totalRuns,
  //       wicketCount,
  //       totalOvers,
  //       scoringTeam: scoringTeam,
  //       chessingTeam: chessingTeam,
  //       overCount,
  //       ballCount,
  //       hasMatchEnded,
  //       remainingRuns,
  //       remainingBalls,
  //       batter1,
  //       batter2,
  //       bowler,
  //       bowlers,
  //       extras,
  //       recentOvers,
  //       inning1: match.inning1,
  //       inning2: match.inning2,
  //     };

  //     console.log("Updating match with ID (from count):", matchId);

  //     const response = await fetch(
  //       `${process.env.REACT_APP_API_BASE_URL}/live/match/${matchId}/update`,
  //       {
  //         method: "PATCH",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify(updatePayload),
  //       },
  //     );

  //     const result = await response.json();

  //     if (!response.ok) {
  //       console.error("Error updating match:", result.message || result);
  //     } else {
  //       console.log("Match updated successfully:", result);
  //     }
  //   } catch (err) {
  //     console.error("Error in updateLiveMatch:", err.message || err);
  //   }
  // };

  /////////////

  // Settings
    const handleClick = async (type, id = null) => {
      try {
        // let newMatchValue = null;

        // switch (type) {
        //   case "new":
        //     newMatchValue = false;
        //     break;
        //   default:
        //     break;
        // }

          // 🔹 Update newmatch
          // // 2. Perform PATCH only if exists
          // const patchRes = await fetch(
          //   `${process.env.REACT_APP_API_BASE_URL}/matches/${matchData?._id}/toggle`,
          //   {
          //     method: "PATCH",
          //     headers: { "Content-Type": "application/json" },
          //     body: JSON.stringify({ newmatch: newMatchValue }),
          //   }
          // );

          // if (!patchRes.ok) {
          //   console.error("Failed to update match");
          //   return;
          // }

          // props.setNewMatch(newMatchValue);


        switch (type) {
          case "new":
// ASH      
            await handleReset();
            resetAllStateForNewMatch(); 
            
            await createLiveMatch({
              inningNo,
              totalRuns,
              wicketCount,
              totalOvers,
              overCount,
              ballCount,
              hasMatchEnded,
              remainingRuns,
              remainingBalls,
              match,
              batter1,
              batter2,
              bowler,
              bowlers,
              extras,
              recentOvers,
            });

            navigate("/form", { state: { newMatch: true } });
            break;

          case "edit":
            navigate("/EditPassward");
            break;

          case "photo":
            navigate("/Photos");
            break;

          case "advertise":
            navigate("/Advertise");
            break;

          case "add":
            navigate("/MatchData");
            break;

          case "help":
            navigate("/help");
            break;

          case "score":
            console.log(id);
            navigate(`/scorecard/${id}`);
            break;

          case "logout":
            localStorage.removeItem("token");
            props.setAdmin(false);
            navigate("/");
            break;

          default:
            break;
        }
      } catch (error) {
        console.error("Error updating values:", error);
      }
    };

  const getBowlersForTable = ({ tableInning }) => {
    // ================= USER SIDE =================
    if (!props.Admin) {
      if (tableInning === 1) {
        return liveData?.inning1?.bowlers || [];
      }
      if (tableInning === 2) {
        return liveData?.inningNo === 2
          ? liveData?.inning2?.bowlers || []
          : [];
      }
    }

    // ================= ADMIN SIDE =================
    if (props.Admin) {
      // -------- INNING 1 TABLE --------
      if (tableInning === 1) {
        if (inningNo === 1) {
          // ADMIN + INNING 1 → LOCAL
          const map = new Map();

          (match?.inning1?.bowlers || []).forEach(
            (b) => b?.name && map.set(b.name, b),
          );

          if (match?.bowler?.name) {
            map.set(match.bowler.name, match.bowler);
          }

          return Array.from(map.values());
        } else {
          // ADMIN + INNING 2 → DATABASE
          return liveData?.inning1?.bowlers || [];
        }
      }

      // -------- INNING 2 TABLE --------
      if (tableInning === 2) {
        if (inningNo === 2) {
          // ADMIN + INNING 2 → LOCAL
          const map = new Map();

          (match?.inning2?.bowlers || []).forEach(
            (b) => b?.name && map.set(b.name, b),
          );

          if (match?.bowler?.name) {
            map.set(match.bowler.name, match.bowler);
          }

          return Array.from(map.values());
        } else {
          // ADMIN + INNING 1 → NO DATA
          return [];
        }
      }
    }

    return [];
  };

  const EMPTY_EXTRAS = { total: 0, wide: 0, noBall: 0, Lb: 0, Bye: 0 };

  const getExtrasForTable = ({ tableInning }) => {
    // ========== USER ==========
    if (!props.Admin) {
      if (tableInning === 1) return liveData?.inning1?.extras || EMPTY_EXTRAS;
      if (tableInning === 2) {
        return liveData?.inningNo === 2
          ? liveData?.inning2?.extras || EMPTY_EXTRAS
          : EMPTY_EXTRAS;
      }
    }

    // ========== ADMIN ==========
    if (props.Admin) {
      // INNING 1
      if (tableInning === 1) {
        return inningNo === 1
          ? match?.inning1?.extras || EMPTY_EXTRAS
          : liveData?.inning1?.extras || EMPTY_EXTRAS;
      }

      // INNING 2
      if (tableInning === 2) {
        return inningNo === 2
          ? match?.inning2?.extras || EMPTY_EXTRAS
          : EMPTY_EXTRAS;
      }
    }

    return EMPTY_EXTRAS;
  };

  // Edit Match
  // const handleEndInning1 = async (e) => {
  // try {
  //   console.log("Press");
  //   if (matchData?._id) {
  //     console.log(matchData._id)
  //     await fetch(`${process.env.REACT_APP_API_BASE_URL}/matches/${matchData._id}/toggle`, {
  //       method: "PATCH",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ newmatch: false }),
  //     });
  //     props.setNewMatch(false);
  //   }
  //   navigate("/score");
  //   } catch (error) {
  //   console.error("Error ending inning and updating newmatch:", error);
  //   }
  // };

  /** Full clear for next match (after Save or Reset). Drops persisted scoreboard keys so refresh does not restore old innings. */
  const resetAllStateForNewMatch = () => {
    try {
      SCOREBOARD_STORAGE_KEYS.forEach((k) => localStorage.removeItem(k));
      localStorage.removeItem("data");
    } catch (_) {
      /* ignore */
    }
    setMatch(createEmptyMatchState());
    setInningNo(1);
    setTotalRuns(0);
    setWicketCount(0);
    setTotalWicket(0);
    setTotalOvers(0);
    setBallCount(0);
    setOverCount(0);
    setCurrentRunStack([]);
    setExtras({ total: 0, wide: 0, noBall: 0, Lb: 0, Bye: 0 });
    setRunsByOver(0);
    setRemainingBalls(0);
    setRemainingRuns(0);
    setBatter1({});
    setBatter2({});
    setBatters([]);
    setBowlers([]);
    setBattingOrder(0);
    setInputBowler("");
    setBowler({});
    setStrikeValue("strike");
    setBatter1InputDisabled(false);
    setBatter2InputDisabled(false);
    setBowlerInputDisabled(false);
    setBatter1SaveConfirmed(false);
    setBatter2SaveConfirmed(false);
    setBowlerSaveConfirmed(false);
    setBatter1Edited(false);
    setBatter2Edited(false);
    setBowlerEdited(false);
    setKeypadAllDisabled(false);
    setKeypadActiveDisabled(false);
    setKeypadActive1Disabled(false);
    setNoBallVisualOnInactive(false);
    setWideLbVisualOnInactive1(false);
    setNoBall(false);
    setwideBall(false);
    setLb(false);
    setBye(false);
    setOverthrowMode(null);
    setOverthrowBaseRun(null);
    setRecentOvers([]);
    setRecentOvers1([]);
    setModalOpen(false);
    setRunOutPlayerId("");
    setRunOutCompletedRuns(0);
    setOutType("");
    setRunOutPlayerUiVisible(false);
    setRunOutPlayerErrorVisible(false);
    setRunrate(0);
    setButtonstate(false);
    setreset(true);
    setNameSuggested(false);
    setSuggestions([]);
    setActiveSection("matchInfo");
    setMatchEnded(false);
    setLiveData(null);
    setMatchData(null);
    setEndInningButtonLabelOverride(null);
    setIsSlideOpen1(false);
    setIsSlideOpen2(false);
    chaseResultKeypadLockedRef.current = false;
  };

  const handleReset = async (e) => {
    try {

      // 1. Check and delete latest unended match
      if (liveData && liveData.hasMatchEnded === false) {
        await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/live/delete/latest-unended`,
          {
            method: "DELETE",
          },
        );
        console.log("Deleted latest unended match");
      }

      // 2. Update the match state in DB (optional if needed)
      if (matchData?._id) {
        console.log("Match ID:", matchData._id);
        await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/matches/${matchData._id}/toggle`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ newmatch: false }),
          },
        );
        props.setNewMatch(false);

        await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/matches/delete/${matchData._id}`,
        { method: "DELETE" }
        );
      }
      resetAllStateForNewMatch();
      // 3. Navigate to score page
      navigate("/score");
    } catch (error) {
      console.error("Error ending inning and deleting unended match:", error);
    }
  }

  const handleEndInning1 = async (e) => {
    try {
      // console.log("Press");
      // setBatter1({});
      // setBatter2({});
      // setBowlers([]);
      // setRecentOvers([]);

      // 2. Update the match state in DB (optional if needed)
      if (matchData?._id) {
        console.log("Match ID:", matchData._id);
        await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/matches/${matchData._id}/toggle`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ newmatch: false }),
          },
        );
        props.setNewMatch(false);

      }
 
      // 3. Navigate to score page
      navigate("/score");
    } catch (error) {
      console.error("Error ending inning and deleting unended match:", error);
    }
  };

  // New Result — reads `match.inning1` / `match.inning2` (authoritative totals after End Inning)
  const handleSave = async () => {
    const mid = matchData?._id;
    const sid = liveData?._id;
    if (!mid || !sid) {
      console.error("Save failed: missing matchId or live scoreId", {
        matchId: mid,
        scoreId: sid,
      });
      throw new Error("Cannot save: missing match or live session");
    }

    const m1 = match.inning1 || {};
    const m2 = match.inning2 || {};
    const plainInning1 = {
      runs: Number(m1.runs ?? 0),
      wickets: Number(m1.wickets ?? 0),
      overs:
        m1.overs != null && m1.overs !== ""
          ? String(m1.overs)
          : "0",
    };
    const plainInning2 = {
      runs: Number(m2.runs ?? 0),
      wickets: Number(m2.wickets ?? 0),
      overs:
        m2.overs != null && m2.overs !== ""
          ? String(m2.overs)
          : "0",
    };

    const scoreData = {
      matchType: matchData.matchType,
      scoringTeam,
      chessingTeam,
      inning1: plainInning1,
      inning2: plainInning2,
      winnerCard3: winningMessage,
      maxOver,
      date: currentDate || new Date().toISOString().slice(0, 10),
      matchId: mid,
      scoreId: sid,
    };

    await fetch(
      `${process.env.REACT_APP_API_BASE_URL}/matches/${mid}/toggle`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newmatch: false }),
      },
    );
    props.setNewMatch(false);

    await axios.post(
      `${process.env.REACT_APP_API_BASE_URL}/score/save`,
      scoreData,
    );
  };

  const handleDelete = async (id) => {
  try {
    // 1. Fetch score to get matchId & scoreId
    const scoreRes = await fetch(
      `${process.env.REACT_APP_API_BASE_URL}/score/${id}`
    );

    const scoreData = await scoreRes.json();

    if (!scoreRes.ok) {
      console.error("Failed to fetch score");
      return;
    }

    const { matchId, scoreId } = scoreData;

    // 2. Delete match
    if (matchId) {
      await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/matches/delete/${matchId}`,
        { method: "DELETE" }
      );
    }

    // 3. Delete live (scoreId)
    if (scoreId) {
      await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/live/delete/${scoreId}`,
        { method: "DELETE" }
      );
    }

    // 4. Delete score
    const deleteScoreRes = await fetch(
      `${process.env.REACT_APP_API_BASE_URL}/score/delete/${id}`,
      { method: "DELETE" }
    );

    const deleteData = await deleteScoreRes.json();

    if (deleteScoreRes.ok) {
      console.log("Deleted successfully:", deleteData.message);
      // Keep UI live without full refresh.
      setScores((prev) => prev.filter((s) => s._id !== id));
    } else {
      console.error("Score deletion failed");
    }

  } catch (err) {
    console.error("Error during deletion:", err);
  }
};

  const getEndInningButtonLabel = useCallback(() => {
    if (endInningButtonLabelOverride !== null) {
      return endInningButtonLabelOverride;
    }
    if (liveData && !liveData.hasMatchEnded) {
      if (inningNo === 1) {
        return overCount === maxOver || wicketCount === TotalWicket
          ? "End Inning"
          : "live";
      }
      const chaseTarget = (match?.inning1?.runs ?? 0) + 1;
      return overCount === maxOver ||
        chaseTarget <= totalRuns ||
        wicketCount === TotalWicket ||
        remainingBalls === 0 ||
        remainingRuns === 0
        ? "Score Board"
        : "live";
    }
    return "Save";
  }, [
    endInningButtonLabelOverride,
    liveData,
    inningNo,
    maxOver,
    wicketCount,
    TotalWicket,
    overCount,
    totalRuns,
    match?.inning1?.runs,
    remainingBalls,
    remainingRuns,
  ]);

  /** Clear live scoring UI + localStorage-backed session fields after match ends; keeps `match` (final innings) and `hasMatchEnded`. */
  const resetLiveStateAfterMatchEnd = () => {
    setCurrentRunStack([]);
    setTotalRuns(0);
    setExtras({ total: 0, wide: 0, noBall: 0, Lb: 0, Bye: 0 });
    setRunsByOver(0);
    setWicketCount(0);
    setTotalOvers(0);
    setBallCount(0);
    setOverCount(0);
    setBatter1({});
    setBatter2({});
    setBatters([]);
    setBowlers([]);
    setBattingOrder(0);
    setInputBowler("");
    setBowler({});
    setBatter1InputDisabled(false);
    setBatter2InputDisabled(false);
    setBowlerInputDisabled(false);
    setBatter1SaveConfirmed(false);
    setBatter2SaveConfirmed(false);
    setBowlerSaveConfirmed(false);
    setBatter1Edited(false);
    setBatter2Edited(false);
    setBowlerEdited(false);
    setStrikeValue("strike");
    setKeypadAllDisabled(false);
    setKeypadActiveDisabled(false);
    setKeypadActive1Disabled(false);
    setNoBallVisualOnInactive(false);
    setWideLbVisualOnInactive1(false);
    setNoBall(false);
    setwideBall(false);
    setLb(false);
    setBye(false);
    setOverthrowMode(null);
    setOverthrowBaseRun(null);
    setRecentOvers([]);
    setRecentOvers1([]);
    try {
      localStorage.setItem("batters", JSON.stringify([]));
      localStorage.setItem("recentOvers", JSON.stringify([]));
      localStorage.setItem("recentOvers1", JSON.stringify([]));
    } catch (_) {
      /* ignore */
    }
    setRemainingBalls(0);
    setRemainingRuns(0);
    setModalOpen(false);
    setRunOutPlayerId("");
    setRunOutCompletedRuns(0);
    setOutType("");
    setRunOutPlayerUiVisible(false);
    setRunOutPlayerErrorVisible(false);
    setRunrate(0);
    setButtonstate(false);
    setreset(true);
    setNameSuggested(false);
    setSuggestions([]);
    setActiveSection("matchInfo");
    chaseResultKeypadLockedRef.current = false;
  };

  // Live Score and scoreboard
  const handleEndInning = async (e) => {
    const label = getEndInningButtonLabel();
    if (label !== "live") {
      if (label === "Save") {
        try {
          await handleSave();
          await handleEndInning1();
        } catch (err) {
          console.error("Save or navigation failed:", err);
          return;
        }
        resetAllStateForNewMatch();
      } else {
        // set data in Scorebord after press on end-inning and scorecard

        let finalBatters = [...batters];
        if (batter1.id !== undefined) {
          const exists = finalBatters.some((b) => b.id === batter1.id);
          if (!exists) {
            finalBatters = [
              ...finalBatters,
              {
                id: batter1.id,
                name: batter1.name + " *",
                run: batter1.run,
                ball: batter1.ball,
                four: batter1.four,
                six: batter1.six,
                strikeRate: batter1.strikeRate,
                onStrike: batter1.onStrike,
                battingOrder: batter1.battingOrder,
                battingStatus: BATTING,
              },
            ];
          }
        }

        if (batter2.id !== undefined) {
          const exists = finalBatters.some((b) => b.id === batter2.id);
          if (!exists) {
            finalBatters = [
              ...finalBatters,
              {
                id: batter2.id,
                name: batter2.name + " *",
                run: batter2.run,
                ball: batter2.ball,
                four: batter2.four,
                six: batter2.six,
                strikeRate: batter2.strikeRate,
                onStrike: batter2.onStrike,
                battingOrder: batter2.battingOrder,
                battingStatus: BATTING,
              },
            ];
          }
        }
        setBatters(finalBatters);

        let finalBowlers = [...bowlers];

        if (bowler.id !== undefined) {
          const currentDisplayOver =
            Math.round((ballCount === 6 ? 1 : ballCount * 0.1) * 10) / 10;
          let isMaidenOver = true;
          let countWicket = 0;
          let countNoBall = 0;
          let countWide = 0;
          const deliveries = ["1", "2", "3", "4", "6", "wd"];
          for (let delivery of currentRunStack) {
            delivery = delivery.toString();
            if (
              deliveries.includes(delivery) ||
              delivery.includes("nb") ||
              wicketTokenBreaksMaiden(delivery)
            ) {
              isMaidenOver = false;
            }
            if (isWicketStackEntry(delivery)) {
              countWicket++;
            }
            if (delivery.includes("nb")) {
              countNoBall++;
            }
            if (delivery.includes("wd")) {
              countWide++;
            }
          }
          if (ballCount !== 6) {
            isMaidenOver = false;
          }
          const index = finalBowlers.findIndex((blr) => {
            return blr.id === bowler.id;
          });
          if (index !== -1) {
            const existingBowler = finalBowlers[index];
            const { maiden, wicket, noBall, wide, over } = existingBowler;
            const bowlerTotalOver = over + ballCount / 6;
            const updatedBowler = {
              ...existingBowler,
              over: existingBowler.over + currentDisplayOver,
              maiden: isMaidenOver ? maiden + 1 : maiden,
              run: existingBowler.run + runsByOver,
              wicket: wicket + countWicket,
              noBall: noBall + countNoBall,
              wide: wide + countWide,
            };
            updatedBowler.economy =
              Math.round((updatedBowler.run / bowlerTotalOver) * 100) / 100;
            finalBowlers = finalBowlers.map((b, i) =>
              i === index ? updatedBowler : b,
            );
          } else {
            if (ballCount !== 6) {
              const newentry = {
                id: bowler.id,
                name: bowler.name,
                over: currentDisplayOver,
                maiden: isMaidenOver ? 1 : 0,
                run: runsByOver,
                wicket: countWicket,
                noBall: countNoBall,
                wide: countWide,
                economy: Math.round((runsByOver / (ballCount / 6)) * 100) / 100,
              };
              finalBowlers = [...finalBowlers, newentry];
            }
          }
        }
        setBowlers(finalBowlers);

        const recentOversForSave = appendPartialStackToRecentOversList(
          recentOvers,
        );

        if (inningNo === 1) {
          setMatch((state) => {
            const totalFours = finalBatters
              .map((batter) => batter.four ?? 0)
              .reduce((prev, next) => prev + next, 0);
            const totalSixes = finalBatters
              .map((batter) => batter.six ?? 0)
              .reduce((prev, next) => prev + next, 0);
            return {
              ...state,
              bowler: {
                id: "",
                name: "",
                over: 0,
                maiden: 0,
                run: 0,
                wicket: 0,
                economy: 0,
              },
              bowlers: [],
              inning1: {
                runs: totalRuns,
                wickets: wicketCount,
                runRate: crr,
                overs: totalOvers,
                four: totalFours,
                six: totalSixes,
                extras,
                batters: finalBatters,
                bowlers: finalBowlers,
                recentOvers: recentOversForSave,
              },
            };
          });
          var data = recentOversForSave;
          setRecentOvers1(data);
          setInningNo(2);
          setCurrentRunStack([]);
          setTotalRuns(0);
          setExtras({ total: 0, wide: 0, noBall: 0, Lb: 0, Bye: 0 });
          setRunsByOver(0);
          setWicketCount(0);
          setTotalOvers(0);
          setBallCount(0);
          setOverCount(0);
          setRecentOvers([]);
          setBatter1({});
          setBatter2({});
          setBatters([]);
          setBowlers([]);
          setBattingOrder(0);
          setInputBowler("");
          setBowler({});
          setRemainingBalls(maxOver * 6);
          setRemainingRuns(totalRuns + 1);
          setInputBowler("");
          setBowlerInputDisabled(false);
          setBatter1InputDisabled(false);
          setBatter2InputDisabled(false);
          setBatter1SaveConfirmed(false);
          setBatter2SaveConfirmed(false);
          setBowlerSaveConfirmed(false);
          setStrikeValue("strike");
          setKeypadAllDisabled(false);
          setKeypadActiveDisabled(false);
          setKeypadActive1Disabled(false);
          setNoBallVisualOnInactive(false);
          setWideLbVisualOnInactive1(false);
          setNoBall(false);
          setwideBall(false);
          setLb(false);
          setBye(false);
          setOverthrowMode(null);
          setOverthrowBaseRun(null);
          chaseResultKeypadLockedRef.current = false;

          ////
          // endInningButton.disabled = true;
          ////
          // window.location.reload(); // Refresh the page
        } else {
          setMatch((state) => {
            const totalFours = finalBatters
              .map((batter) => batter.four ?? 0)
              .reduce((prev, next) => prev + next, 0);
            const totalSixes = finalBatters
              .map((batter) => batter.six ?? 0)
              .reduce((prev, next) => prev + next, 0);
            return {
              ...state,
              bowler: {
                id: "",
                name: "",
                over: 0,
                maiden: 0,
                run: 0,
                wicket: 0,
                economy: 0,
              },
              bowlers: [],
              inning2: {
                runs: totalRuns,
                wickets: wicketCount,
                runRate: crr,
                overs: totalOvers,
                four: totalFours,
                six: totalSixes,
                extras,
                batters: finalBatters,
                bowlers: finalBowlers,
                recentOvers: recentOversForSave,
              },
            };
          });
          // ek state mentain kar
          setreset(false);
          setMatchEnded(true);
          setEndInningButtonLabelOverride("Save");
          resetLiveStateAfterMatchEnd();
          // window.location.reload(); // Refresh the page
        }
      }
    }

  };

  // const handleLIVEscore = () => {
  //   const endInningButton = document.getElementById("end-inning") || "";

  //   if (endInningButton.textContent === "live") {

  // // ===============================
  // // LIVE BATTERS (INCLUDE OUT BATTERS)
  // // ===============================
  // const liveBattersMap = new Map();

  // // 1️⃣ Add all existing batters (includes OUT batters)
  // batters?.forEach((b) => {
  //   liveBattersMap.set(b.id, {
  //     ...b,
  //     onStrike: false, // default
  //   });
  // });

  // // helper to merge current batter with existing
  // const mergeBatter = (currentBatter) => {
  //   if (!currentBatter?.id) return;

  //   const existing = liveBattersMap.get(currentBatter.id);

  //   const totalRuns =
  //     (existing?.run || 0) + (currentBatter.run || 0);

  //   const totalBalls =
  //     (existing?.ball || 0) + (currentBatter.ball || 0);

  //   const totalFours =
  //     (existing?.four || 0) + (currentBatter.four || 0);

  //   const totalSixes =
  //     (existing?.six || 0) + (currentBatter.six || 0);

  //   const strikeRate =
  //     totalBalls > 0
  //       ? Math.round((totalRuns / totalBalls) * 100 * 100) / 100
  //       : 0;

  //   liveBattersMap.set(currentBatter.id, {
  //     id: currentBatter.id,
  //     name: currentBatter.name,
  //     run: totalRuns,
  //     ball: totalBalls,
  //     four: totalFours,
  //     six: totalSixes,
  //     strikeRate,
  //     onStrike: currentBatter.onStrike,
  //     battingStatus: BATTING,
  //   });
  // };

  // // 2️⃣ Merge current batters
  // mergeBatter(batter1);
  // mergeBatter(batter2);

  // // 3️⃣ Final live batters list (ALL batters)
  // const liveBatters = Array.from(liveBattersMap.values());

  //     // ===============================
  //     // LIVE BOWLER (CUMULATIVE)
  //     // ===============================
  //     const existingBowler = bowlers?.find(
  //       (b) => b.id === bowler?.id
  //     );

  //     const currentOverOvers =
  //       Math.floor(ballCount / 6) + (ballCount % 6) / 10;

  //     const currentOverDecimal = ballCount / 6;

  //     const totalOversDecimal =
  //       (existingBowler?.over || 0) + currentOverDecimal;

  //     const totalRuns_over =
  //       (existingBowler?.run || 0) + runsByOver;

  //     const totalWickets =
  //       (existingBowler?.wicket || 0) + wicketCount;

  //         // CRR
  //         const overs = overCount + ballCount / 6;
  //         let crr = (totalRuns / overs).toFixed(2);
  //         crr = isFinite(crr) ? crr : 0;

  //         setRunrate(crr);

  //     const liveBowler = bowler?.id
  //       ? {
  //           id: bowler.id,
  //           name: bowler.name,
  //           maiden: existingBowler?.maiden || 0,
  //           over: (existingBowler?.over || 0) + currentOverOvers,
  //           run: totalRuns_over,
  //           wicket: totalWickets,
  //           economy:
  //             totalOversDecimal > 0
  //               ? Math.round((totalRuns / totalOversDecimal) * 100) / 100
  //               : 0,
  //         }
  //       : null;

  //     const updatedBowlers = liveBowler
  //       ? [
  //           ...bowlers.filter((b) => b.id !== liveBowler.id),
  //           liveBowler,
  //         ]
  //       : bowlers;

  //     // ===============================
  //     // UPDATE MATCH STATE
  //     // ===============================

  // setMatch((state) => ({
  //   ...state,

  //   // ✅ current bowler live data
  //   bowler: liveBowler || state.bowler,

  //   // ✅ all bowlers live data
  //   bowlers: updatedBowlers,

  //   [`inning${inningNo}`]: {
  //     ...state[`inning${inningNo}`],
  //     runs: totalRuns_over,
  //     wickets: wicketCount,
  //     overs: totalOvers,
  //     runRate: crr,
  //     extras,
  //     batters: liveBatters,
  //     bowlers: updatedBowlers,
  //     recentOvers,
  //   },
  // }));

  //     console.log(match);
  //     console.log("✅ Live scorecard updated");
  //   }
  // };

  const handleLIVEscore = useCallback(() => {
    if (getEndInningButtonLabel() === "live") {
      const liveBattersMap = new Map();

      batters?.forEach((b) => {
        liveBattersMap.set(b.id, {
          ...b,
          onStrike: false,
        });
      });

      const mergeBatter = (currentBatter) => {
        if (!currentBatter?.id) return;

        const existing = liveBattersMap.get(currentBatter.id);

        const totalRuns = (existing?.run || 0) + (currentBatter.run || 0);
        const totalBalls = (existing?.ball || 0) + (currentBatter.ball || 0);
        const totalFours = (existing?.four || 0) + (currentBatter.four || 0);
        const totalSixes = (existing?.six || 0) + (currentBatter.six || 0);

        const strikeRate =
          totalBalls > 0
            ? Math.round((totalRuns / totalBalls) * 100 * 100) / 100
            : 0;

        liveBattersMap.set(currentBatter.id, {
          id: currentBatter.id,
          name: currentBatter.name,
          run: totalRuns,
          ball: totalBalls,
          four: totalFours,
          six: totalSixes,
          strikeRate,
          onStrike: currentBatter.onStrike,
          battingStatus: BATTING,
        });
      };

      mergeBatter(batter1);
      mergeBatter(batter2);

      const liveBatters = Array.from(liveBattersMap.values());

      const existingBowler = bowlers?.find((b) => b.id === bowler?.id);

      const currentOverOvers = Math.floor(ballCount / 6) + (ballCount % 6) / 10;

      const currentOverDecimal = ballCount / 6;

      const totalOversDecimal =
        (existingBowler?.over || 0) + currentOverDecimal;

      const totalRuns_over = (existingBowler?.run || 0) + runsByOver;

      const totalWickets = (existingBowler?.wicket || 0) + wicketCount;

      const overs = overCount + ballCount / 6;
      let crr = (totalRuns / overs).toFixed(2);
      crr = isFinite(crr) ? crr : 0;

      setRunrate(crr);

      const liveBowler = bowler?.id
        ? {
            id: bowler.id,
            name: bowler.name,
            maiden: existingBowler?.maiden || 0,
            over: (existingBowler?.over || 0) + currentOverOvers,
            run: totalRuns_over,
            wicket: totalWickets,
            economy:
              totalOversDecimal > 0
                ? Math.round((totalRuns / totalOversDecimal) * 100) / 100
                : 0,
          }
        : null;

      const updatedBowlers = liveBowler
        ? [...bowlers.filter((b) => b.id !== liveBowler.id), liveBowler]
        : bowlers;

      setMatch((state) => ({
        ...state,
        bowler: liveBowler || state.bowler,
        bowlers: updatedBowlers,
        [`inning${inningNo}`]: {
          ...state[`inning${inningNo}`],
          runs: totalRuns_over,
          wickets: wicketCount,
          overs: totalOvers,
          runRate: crr,
          extras,
          batters: liveBatters,
          bowlers: updatedBowlers,
          recentOvers,
        },
      }));

      console.log("✅ Live scorecard updated");
    }
  }, [
    batters,
    batter1,
    batter2,
    bowlers,
    bowler,
    ballCount,
    runsByOver,
    wicketCount,
    overCount,
    totalRuns,
    totalOvers,
    inningNo,
    extras,
    recentOvers,
    setMatch,
    setRunrate,
    getEndInningButtonLabel,
  ]);
  // Note: do not add `match` here — setMatch inside this callback would recreate it every
  // time and is unnecessary because setMatch uses a functional updater.

  const commitBatter1 = () => {
    let name = String(batter1?.name ?? "").trim();
    if (!name) return;
    name = name.charAt(0).toUpperCase() + name.slice(1);
    setBatter1SaveConfirmed(true);
    setBatter1InputDisabled(true);
    if (isBatter1Edited) {
      setBatter1((state) => ({
        ...state,
        name,
      }));
      setBatter1Edited(false);
    } else if (batter1?.id) {
      /** Re-save after save flag cleared (e.g. last wicket / refresh) — keep R/B/SR; do not treat as new batter. */
      setBatter1((state) => ({
        ...state,
        name,
      }));
    } else {
      const randomNo = MathUtil.getRandomNo();
      setBatter1({
        id: name + randomNo,
        name,
        run: 0,
        ball: 0,
        four: 0,
        six: 0,
        strikeRate: 0,
        onStrike: strikeValue === "strike" ? true : false,
        battingOrder: battingOrder + 1,
        battingStatus: BATTING,
      });
      setBattingOrder(battingOrder + 1);
    }
  };

  const commitBatter2 = () => {
    let name = String(batter2?.name ?? "").trim();
    if (!name) return;
    name = name.charAt(0).toUpperCase() + name.slice(1);
    setBatter2SaveConfirmed(true);
    setBatter2InputDisabled(true);
    if (isBatter2Edited) {
      setBatter2((state) => ({
        ...state,
        name,
      }));
      setBatter2Edited(false);
    } else if (batter2?.id) {
      setBatter2((state) => ({
        ...state,
        name,
      }));
    } else {
      const randomNo = MathUtil.getRandomNo();
      setBatter2({
        id: name + randomNo,
        name,
        run: 0,
        ball: 0,
        four: 0,
        six: 0,
        strikeRate: 0,
        onStrike: strikeValue === "non-strike" ? true : false,
        battingOrder: battingOrder + 1,
        battingStatus: BATTING,
      });
      setBattingOrder(battingOrder + 1);
    }
  };

  const commitBowler = () => {
    let name = String(inputBowler ?? "").trim();
    if (!name) return;
    name = name.charAt(0).toUpperCase() + name.slice(1);
    setInputBowler(name);
    setBowlerSaveConfirmed(true);
    setBowlerInputDisabled(true);
    if (isBowlerEdited) {
      setBowler((state) => ({
        ...state,
        name,
      }));
      setBowlerEdited(false);
    } else {
      if (hasNameSuggested) {
        setNameSuggested(false);
        setBowler((state) => ({ ...state, name }));
      } else {
        const randomNo = MathUtil.getRandomNo();
        const id = name + randomNo;
        setBowler({
          id,
          name,
          over: 0,
          maiden: 0,
          run: 0,
          wicket: 0,
          economy: 0,
        });
      }
    }
  };

  const onSuggestionsFetchRequested = (param) => {
    const inputValue = String(param.value ?? "").trim().toLowerCase();
    const suggestionArr =
      inputValue.length === 0
        ? []
        : bowlers.filter((bowlerObj) =>
            String(bowlerObj.name ?? "")
              .toLowerCase()
              .includes(inputValue),
          );
    setSuggestions(suggestionArr);
  };

  const getSuggestionValue = (suggestion) => {
    setBowlerSaveConfirmed(false);
    setBowler({
      id: suggestion.id,
      name: suggestion.name,
      over: suggestion.over,
      maiden: suggestion.maiden,
      run: suggestion.run,
      wicket: suggestion.wicket,
      economy: suggestion.economy,
    });
    setNameSuggested(true);
    return suggestion.name == null ? "" : String(suggestion.name);
  };

  const inputProps = {
    value: inputBowler ?? "",
    onChange: (e, { newValue }) => {
      setBowlerSaveConfirmed(false);
      setInputBowler(newValue == null ? "" : String(newValue));
    },
    disabled: bowlerInputDisabled,
  };

  const overCompleted = (runsByOverParam, currentRunStackParam) => {
    if (overCount + 1 !== maxOver) {
      setBowlerInputDisabled(false);
    }
    setKeypadAllDisabled(true);
    const overBowlerLabel =
      bowler?.name == null ? "" : String(bowler.name);
    setRecentOvers((state) => [
      ...state,
      {
        overNo: overCount + 1,
        bowler: overBowlerLabel,
        runs: runsByOverParam,
        stack: currentRunStackParam,
      },
    ]);
    setCurrentRunStack([]);
    setRunsByOver(0);
    setBallCount(0);
    setOverCount(overCount + 1);
    const index = bowlers.findIndex((blr) => blr.id === bowler.id);
    let isMaidenOver = true;
    let countWicket = 0;
    let countNoBall = 0;
    let countWide = 0;
    const deliveries = ["1", "2", "3", "4", "6", "wd"];
    for (let delivery of currentRunStackParam) {
      delivery = delivery.toString();
      if (
        deliveries.includes(delivery) ||
        delivery.includes("nb") ||
        wicketTokenBreaksMaiden(delivery)
      ) {
        isMaidenOver = false;
      }
      if (isWicketStackEntry(delivery)) {
        countWicket++;
      }
      if (delivery.includes("nb")) {
        countNoBall++;
      }
      if (delivery.includes("wd")) {
        countWide++;
      }
    }
    if (index !== -1) {
      const existingBowler = bowlers[index];
      const { over, maiden, run, wicket, noBall, wide } = existingBowler;
      const updatedBowler = {
        ...existingBowler,
        over: over + 1,
        maiden: isMaidenOver ? maiden + 1 : maiden,
        run: run + runsByOverParam,
        wicket: wicket + countWicket,
        noBall: noBall + countNoBall,
        wide: wide + countWide,
      };
      updatedBowler.economy =
        Math.round((updatedBowler.run / updatedBowler.over) * 100) / 100;
      setBowlers((prev) =>
        prev.map((b, i) => (i === index ? updatedBowler : b)),
      );
    } else {
      const newentry = {
        id: bowler.id,
        name: bowler.name,
        over: 1,
        maiden: isMaidenOver ? 1 : 0,
        run: runsByOverParam,
        wicket: countWicket,
        noBall: countNoBall,
        wide: countWide,
        economy: runsByOverParam,
      };
      setBowlers((state) => [...state, newentry]);
    }
    setBowler({});
    setInputBowler("");
    setBowlerSaveConfirmed(false);
  };

  /** If the match/inning ends mid-over (e.g. n.1–n.5), persist current ball stack into recent overs. */
  const appendPartialStackToRecentOversList = (baseList) => {
    if (!currentRunStack?.length) return baseList;
    if (ballCount >= 6) return baseList;
    const bowlerLabel = bowler?.name == null ? "" : String(bowler.name);
    return [
      ...baseList,
      {
        overNo: overCount + 1,
        bowler: bowlerLabel,
        runs: runsByOver,
        stack: [...currentRunStack],
      },
    ];
  };

  const newBatter1 = () => {
    setBatter1SaveConfirmed(false);
    setBatter1InputDisabled(false);
    const { id, name, run, ball, four, six, strikeRate, onStrike } = batter1;
    setBatters((state) => [
      ...state,
      {
        id,
        name,
        run,
        ball,
        four,
        six,
        strikeRate,
        onStrike,
        battingOrder: batter1.battingOrder,
        battingStatus: OUT,
      },
    ]);
    setBatter1({});
  };

  const newBatter2 = () => {
    setBatter2SaveConfirmed(false);
    setBatter2InputDisabled(false);
    const { id, name, run, ball, four, six, strikeRate, onStrike } = batter2;
    setBatters((state) => [
      ...state,
      {
        id,
        name,
        run,
        ball,
        four,
        six,
        strikeRate,
        onStrike,
        battingOrder: batter2.battingOrder,
        battingStatus: OUT,
      },
    ]);
    setBatter2({});
  };

  // About Edit the batter1 name
  const editBatter1Name = () => {
    if (
      overCount !== maxOver &&
      wicketCount !== TotalWicket &&
      !hasMatchEnded
    ) {
      setBatter1InputDisabled(false);
      setBatter1SaveConfirmed(false);
      setBatter1Edited(true);
    }
  };

  // About Edit the batter2 name
  const editBatter2Name = () => {
    if (
      overCount !== maxOver &&
      wicketCount !== TotalWicket &&
      !hasMatchEnded
    ) {
      setBatter2InputDisabled(false);
      setBatter2SaveConfirmed(false);
      setBatter2Edited(true);
    }
  };

  // About Edit the bowler name
  const editBowlerName = () => {
    if (
      overCount !== maxOver &&
      wicketCount !== TotalWicket &&
      !hasMatchEnded
    ) {
      setBowlerInputDisabled(false);
      setBowlerSaveConfirmed(false);
      setBowlerEdited(true);
    }
  };

  const undoWicket = (
    isNoBallParam,
    runOutExtraRuns = 0,
    opts = {},
  ) => {
    const {
      skipRunTotalsAdjust = false,
      creditNbStrikerFaceBall = false,
      skipLegalBallCountAdjust = false,
      reverseNbRunOutOverProgress = false,
    } = opts;
    const ror = Math.max(0, Number(runOutExtraRuns) || 0);

    if (reverseNbRunOutOverProgress) {
      setBallCount((c) => Math.max(0, c - 1));
      setTotalOvers((t) =>
        Math.round((Number(t) - 0.1) * 10) / 10,
      );
      if (inningNo === 2) {
        setRemainingBalls((x) => x + 1);
      }
    }

    if (!isNoBallParam && !skipLegalBallCountAdjust) {
      setBallCount(ballCount - 1);
      setTotalOvers(Math.round((totalOvers - 0.1) * 10) / 10);
    }
    setWicketCount(wicketCount - 1);

    const dismissed = batters[batters.length - 1];

    if (ror > 0 && !skipRunTotalsAdjust) {
      setTotalRuns(totalRuns - ror);
      setRunsByOver(runsByOver - ror);
      if (inningNo === 2) {
        setRemainingRuns(remainingRuns + ror);
      }
    }

    const adjustStrikerUndoRunOut = (p) => {
      if (!p || p.name === undefined) return p;
      const nb = Math.max(0, (p.ball || 0) - 1);
      let nr = p.run;
      if (ror > 0) nr = Math.max(0, nr - ror);
      let four = p.four;
      if (ror === 4) four = Math.max(0, (four || 0) - 1);
      const sr =
        nb > 0 ? Math.round((nr / nb) * 100 * 100) / 100 : 0;
      return { ...p, ball: nb, run: nr, four, strikeRate: sr };
    };

    const adjustStrikerUndoNbRunOutExtras = (p) => {
      if (!p || p.name === undefined) return p;
      const nb = Math.max(0, (p.ball || 0) - 1);
      let nr = p.run;
      if (ror > 0) nr = Math.max(0, nr - ror);
      let four = p.four;
      if (ror === 4) four = Math.max(0, (four || 0) - 1);
      const sr =
        nb > 0 ? Math.round((nr / nb) * 100 * 100) / 100 : 0;
      return { ...p, ball: nb, run: nr, four, strikeRate: sr };
    };

    if (dismissed.onStrike) {
      if (ror > 0) {
        dismissed.run = Math.max(0, dismissed.run - ror);
        if (ror === 4) dismissed.four = Math.max(0, (dismissed.four || 0) - 1);
      }
      if (!isNoBallParam || creditNbStrikerFaceBall) {
        dismissed.ball = Math.max(0, (dismissed.ball || 0) - 1);
      }
      dismissed.strikeRate =
        dismissed.ball > 0
          ? Math.round((dismissed.run / dismissed.ball) * 100 * 100) / 100
          : 0;
    }

    const { id, name, run, ball, four, six, strikeRate, onStrike } = dismissed;

    if (batter1.name === undefined || batter1.onStrike) {
      setBatter1InputDisabled(true);
      setBatter1({
        id,
        name,
        run,
        ball,
        four,
        six,
        strikeRate,
        onStrike,
        battingOrder: dismissed.battingOrder,
        battingStatus: BATTING,
      });
      if (!dismissed.onStrike) {
        changeStrikeRadio();
        setBatter2((state) => ({
          ...state,
          onStrike: true,
        }));
      }
    } else if (batter2.name === undefined || batter2.onStrike) {
      setBatter2InputDisabled(true);
      setBatter2({
        id,
        name,
        run,
        ball,
        four,
        six,
        strikeRate,
        onStrike,
        battingOrder: dismissed.battingOrder,
        battingStatus: BATTING,
      });
      if (!dismissed.onStrike) {
        changeStrikeRadio();
        setBatter1((state) => ({
          ...state,
          onStrike: true,
        }));
      }
    }

    /** Striker must re-save after undo so Save shows warn (red); other batter unchanged. */
    let onStrikeIsBatter1;
    if (batter1.name === undefined || batter1.onStrike) {
      onStrikeIsBatter1 = dismissed.onStrike;
    } else if (batter2.name === undefined || batter2.onStrike) {
      onStrikeIsBatter1 = !dismissed.onStrike;
    }
    if (onStrikeIsBatter1 === true) {
      setBatter1SaveConfirmed(false);
    } else if (onStrikeIsBatter1 === false) {
      setBatter2SaveConfirmed(false);
    }

    if (!dismissed.onStrike) {
      if (isNoBallParam) {
        if (ror > 0 || creditNbStrikerFaceBall) {
          setBatter1((p) =>
            p && p.onStrike ? adjustStrikerUndoNbRunOutExtras(p) : p,
          );
          setBatter2((p) =>
            p && p.onStrike ? adjustStrikerUndoNbRunOutExtras(p) : p,
          );
        }
      } else {
        setBatter1((p) =>
          p && p.onStrike ? adjustStrikerUndoRunOut(p) : p,
        );
        setBatter2((p) =>
          p && p.onStrike ? adjustStrikerUndoRunOut(p) : p,
        );
      }
    }

    setBatters((prev) => prev.slice(0, -1));
  };

  //////

  // Handle wicket delivery in batsman account
  const handleCurrentBall = (run) => {
    // console.log("Added Entry to batter1");

    if (!isNoBall && !iswideball) {
      if (batter1.onStrike) {
        setBatter1((state) => {
          const updatedRun = state.run + run;
          const updatedBall = state.ball + 1;
          const sr = Math.round((updatedRun / updatedBall) * 100 * 100) / 100;
          return {
            ...state,
            run: updatedRun,
            ball: updatedBall,
            strikeRate: sr,
          };
        });
      } else {
        setBatter2((state) => {
          const updatedRun = state.run + run;
          const updatedBall = state.ball + 1;
          const sr = Math.round((updatedRun / updatedBall) * 100 * 100) / 100;
          return {
            ...state,
            run: updatedRun,
            ball: updatedBall,
            strikeRate: sr,
          };
        });
      }
    }
    if (inningNo === 2) {
      if (!isNoBall && !iswideball) {
        setRemainingBalls(remainingBalls - 1);
      }
    }
  };

  //////

  // Base Logic
  const undoRun = (run, isNoBallParam, iswideballParam, isLbParam) => {
    if (isNoBallParam || iswideballParam) {
      setTotalRuns(totalRuns - (run + 1));
      setRunsByOver(runsByOver - (run + 1));
    } else {
      setTotalRuns(totalRuns - run);
      setRunsByOver(runsByOver - run);
      setBallCount(ballCount - 1);
      setTotalOvers(Math.round((totalOvers - 0.1) * 10) / 10);
      if (!isLbParam) {
        setCurrentRunStack((s) => s.slice(0, -1));
      }
    }

    if (batter1.onStrike) {
      if (run % 2 === 0) {
        setBatter1((state) => {
          const updatedRun =
            !iswideballParam && !isLbParam
              ? state.run >= run
                ? state.run - run
                : 0
              : state.run;
          const updatedBall =
            !isNoBallParam && !iswideballParam && state.ball > 0
              ? state.ball - 1
              : state.ball;
          const updatedSr = updatedBall !== 0 ? updatedRun / updatedBall : 0;
          const sr =
            Math.round(isNaN(updatedSr) ? 0 : updatedSr * 100 * 100) / 100;
          let four = state.four;
          if (run === 4) {
            four = four >= 1 ? four - 1 : four;
          }
          let six = state.six;
          if (run === 6) {
            six = six >= 1 ? six - 1 : six;
          }
          return {
            ...state,
            run: updatedRun,
            ball: updatedBall,
            four: four,
            six: six,
            strikeRate: sr,
          };
        });
      } else {
        changeStrikeRadio();
        switchBatterStrike();
        setBatter2((state) => {
          const updatedRun =
            !iswideballParam && !isLbParam
              ? state.run >= run
                ? state.run - run
                : 0
              : state.run;
          const updatedBall =
            !isNoBallParam && !iswideballParam && state.ball > 0
              ? state.ball - 1
              : state.ball;
          const updatedSr = updatedBall !== 0 ? updatedRun / updatedBall : 0;
          const sr =
            Math.round(isNaN(updatedSr) ? 0 : updatedSr * 100 * 100) / 100;
          let four = state.four;
          if (run === 4) {
            four = four >= 1 ? four - 1 : four;
          }
          let six = state.six;
          if (run === 6) {
            six = six >= 1 ? six - 1 : six;
          }
          return {
            ...state,
            run: updatedRun,
            ball: updatedBall,
            four: four,
            six: six,
            strikeRate: sr,
          };
        });
      }
    } else if (batter2.onStrike) {
      if (run % 2 === 0) {
        setBatter2((state) => {
          const updatedRun =
            !iswideballParam && !isLbParam
              ? state.run >= run
                ? state.run - run
                : 0
              : state.run;
          const updatedBall =
            !isNoBallParam && !iswideballParam && state.ball > 0
              ? state.ball - 1
              : state.ball;
          const updatedSr = updatedBall !== 0 ? updatedRun / updatedBall : 0;
          const sr =
            Math.round(isNaN(updatedSr) ? 0 : updatedSr * 100 * 100) / 100;
          let four = state.four;
          if (run === 4) {
            four = four >= 1 ? four - 1 : four;
          }
          let six = state.six;
          if (run === 6) {
            six = six >= 1 ? six - 1 : six;
          }
          return {
            ...state,
            run: updatedRun,
            ball: updatedBall,
            four: four,
            six: six,
            strikeRate: sr,
          };
        });
      } else {
        changeStrikeRadio();
        switchBatterStrike();
        setBatter1((state) => {
          const updatedRun =
            !iswideballParam && !isLbParam
              ? state.run >= run
                ? state.run - run
                : 0
              : state.run;
          const updatedBall =
            !isNoBallParam && !iswideballParam && state.ball > 0
              ? state.ball - 1
              : state.ball;
          const updatedSr = updatedBall !== 0 ? updatedRun / updatedBall : 0;
          const sr =
            Math.round(isNaN(updatedSr) ? 0 : updatedSr * 100 * 100) / 100;
          let four = state.four;
          if (run === 4) {
            four = four >= 1 ? four - 1 : four;
          }
          let six = state.six;
          if (run === 6) {
            six = six >= 1 ? six - 1 : six;
          }
          return {
            ...state,
            run: updatedRun,
            ball: updatedBall,
            four: four,
            six: six,
            strikeRate: sr,
          };
        });
      }
    }
  };

  /** Legal balls in current over from stack (for restoring ballCount after undoing a wicket that closed an over). */
  const countLegalBallsFromStack = (stack) => {
    let n = 0;
    for (const raw of stack) {
      const t = String(raw);
      if (t === "W" || /^W\+\d+$/.test(t)) n += 1;
      else if (t === "nb+W") continue;
      else if (t === "nbW" || /^nbW\+\d+$/.test(t)) n += 1;
      else if (t === "nb" || /^nb\d+$/.test(t)) continue;
      else if (t.startsWith("wd")) continue;
      else if (t.startsWith("Lb")) n += 1;
      else if (t.startsWith("By")) n += 1;
      else if (t.startsWith("ovw:")) n += 1;
      else if (t.startsWith("ov:")) n += 1;
      else if (!Number.isNaN(Number(raw))) n += 1;
    }
    return n;
  };

  const undoDelivery = () => {
    if (overthrowMode === "before" || overthrowMode === "after") {
      setOverthrowMode(null);
      setOverthrowBaseRun(null);
      return;
    }

    if (currentRunStack.length === 0 && recentOvers.length > 0) {
      const ro = recentOvers[recentOvers.length - 1];
      const stack = Array.isArray(ro?.stack) ? [...ro.stack] : [];
      if (stack.length > 0) {
        const lastTok = stack[stack.length - 1];
        const wicketEndOfOver =
          lastTok === "W" ||
          lastTok === "nb+W" ||
          lastTok === "nbW" ||
          lastTok === "wdW" ||
          lastTok === "LbW" ||
          lastTok === "ByW" ||
          (typeof lastTok === "string" && /^ovw:\d+:\d+$/.test(lastTok)) ||
          (typeof lastTok === "string" && /^wdW\+\d+$/.test(lastTok)) ||
          (typeof lastTok === "string" && /^LbW\+\d+$/.test(lastTok)) ||
          (typeof lastTok === "string" && /^ByW\+\d+$/.test(lastTok)) ||
          (typeof lastTok === "string" && /^W\+\d+$/.test(lastTok)) ||
          (typeof lastTok === "string" && /^nbW\+\d+$/.test(lastTok));
        if (wicketEndOfOver) {
          const bowlerName = ro.bowler == null ? "" : String(ro.bowler);
          const bIdx = bowlers.findIndex(
            (bl) => String(bl.name ?? "") === bowlerName,
          );
          if (bIdx !== -1) {
            const newStack = stack.slice(0, -1);
            const roRuns = Number(ro.runs) || 0;
            let runDeltaTotal = 0;
            if (lastTok === "W") runDeltaTotal = 0;
            else if (lastTok === "nb+W" || lastTok === "nbW") runDeltaTotal = 1;
            else if (lastTok === "wdW") runDeltaTotal = 1;
            else if (typeof lastTok === "string") {
              const mo = lastTok.match(/^ovw:(\d+):(\d+)$/);
              if (mo) {
                runDeltaTotal = (parseInt(mo[1], 10) || 0) + (parseInt(mo[2], 10) || 0);
              }
              const mwd = lastTok.match(/^wdW\+(\d+)$/);
              if (mwd) runDeltaTotal = 1 + (parseInt(mwd[1], 10) || 0);
              const mlb = lastTok.match(/^LbW\+(\d+)$/);
              if (mlb) runDeltaTotal = parseInt(mlb[1], 10) || 0;
              const mby = lastTok.match(/^ByW\+(\d+)$/);
              if (mby) runDeltaTotal = parseInt(mby[1], 10) || 0;
              const mw = lastTok.match(/^W\+(\d+)$/);
              if (mw)
                runDeltaTotal = Math.min(4, parseInt(mw[1], 10) || 0);
              const mn = lastTok.match(/^nbW\+(\d+)$/);
              if (mn)
                runDeltaTotal =
                  1 + Math.min(4, parseInt(mn[1], 10) || 0);
            }

            if (lastTok === "W") {
              undoWicket(false, 0, { skipLegalBallCountAdjust: true });
              if (inningNo === 2) {
                setRemainingBalls((x) => x + 1);
              }
            } else if (
              typeof lastTok === "string" &&
              /^ovw:\d+:\d+$/.test(lastTok)
            ) {
              const om = lastTok.match(/^ovw:(\d+):(\d+)$/);
              const wr = (parseInt(om?.[1] || "0", 10) || 0) + (parseInt(om?.[2] || "0", 10) || 0);
              undoWicket(false, wr, { skipLegalBallCountAdjust: true });
              if (inningNo === 2) {
                setRemainingBalls((x) => x + 1);
              }
            } else if (lastTok === "wdW") {
              setExtras((state) => ({
                ...state,
                total: state.total - 1,
                wide: state.wide - 1,
              }));
              setTotalRuns((t) => t - 1);
              if (inningNo === 2) {
                setRemainingRuns((x) => x + 1);
              }
              undoWicket(true, 0, { skipRunTotalsAdjust: true, skipLegalBallCountAdjust: true });
            } else if (
              typeof lastTok === "string" &&
              /^wdW\+\d+$/.test(lastTok)
            ) {
              const wr = parseInt(lastTok.slice(4), 10) || 0;
              setExtras((state) => ({
                ...state,
                total: state.total - 1,
                wide: state.wide - 1,
              }));
              setTotalRuns((t) => t - 1 - wr);
              if (inningNo === 2) {
                setRemainingRuns((x) => x + wr + 1);
              }
              undoWicket(true, wr, { skipRunTotalsAdjust: true, skipLegalBallCountAdjust: true });
            } else if (lastTok === "LbW" || lastTok === "ByW") {
              undoWicket(false, 0, { skipRunTotalsAdjust: true, skipLegalBallCountAdjust: true });
              if (inningNo === 2) {
                setRemainingBalls((x) => x + 1);
              }
            } else if (
              typeof lastTok === "string" &&
              /^LbW\+\d+$/.test(lastTok)
            ) {
              const wr = parseInt(lastTok.slice(4), 10) || 0;
              undoWicket(false, wr, { skipRunTotalsAdjust: true, skipLegalBallCountAdjust: true });
              if (inningNo === 2) {
                setRemainingBalls((x) => x + 1);
              }
            } else if (
              typeof lastTok === "string" &&
              /^ByW\+\d+$/.test(lastTok)
            ) {
              const wr = parseInt(lastTok.slice(4), 10) || 0;
              undoWicket(false, wr, { skipRunTotalsAdjust: true, skipLegalBallCountAdjust: true });
              if (inningNo === 2) {
                setRemainingBalls((x) => x + 1);
              }
            } else if (typeof lastTok === "string" && /^W\+\d+$/.test(lastTok)) {
              const wr = Math.min(4, parseInt(lastTok.slice(2), 10) || 0);
              undoWicket(false, wr, { skipLegalBallCountAdjust: true });
              if (inningNo === 2) {
                setRemainingBalls((x) => x + 1);
              }
            } else if (lastTok === "nb+W") {
              setExtras((state) => ({
                ...state,
                total: state.total - 1,
                noBall: state.noBall - 1,
              }));
              setTotalRuns((t) => t - 1);
              if (inningNo === 2) {
                setRemainingRuns((x) => x + 1);
              }
              undoWicket(true, 0);
            } else if (lastTok === "nbW") {
              setExtras((state) => ({
                ...state,
                total: state.total - 1,
                noBall: state.noBall - 1,
              }));
              setTotalRuns((t) => t - 1);
              if (inningNo === 2) {
                setRemainingRuns((x) => x + 1);
              }
              undoWicket(true, 0, { creditNbStrikerFaceBall: true });
              if (inningNo === 2) {
                setRemainingBalls((x) => x + 1);
              }
            } else if (typeof lastTok === "string" && /^nbW\+\d+$/.test(lastTok)) {
              const wr = Math.min(4, parseInt(lastTok.slice(4), 10) || 0);
              setExtras((state) => ({
                ...state,
                total: state.total - 1,
                noBall: state.noBall - 1,
              }));
              setTotalRuns((t) => t - 1 - wr);
              if (inningNo === 2) {
                setRemainingRuns((x) => x + wr + 1);
              }
              undoWicket(true, wr, {
                skipRunTotalsAdjust: true,
                creditNbStrikerFaceBall: true,
              });
              if (inningNo === 2) {
                setRemainingBalls((x) => x + 1);
              }
            }

            const nLegal = countLegalBallsFromStack(newStack);
            setRecentOvers((s) => s.slice(0, -1));
            setCurrentRunStack(newStack);
            setOverCount((c) => c - 1);
            setBallCount(nLegal);
            setRunsByOver(Math.max(0, roRuns - runDeltaTotal));
            setTotalOvers(
              Math.round(((overCount - 1) + nLegal * 0.1) * 10) / 10,
            );

            const b = { ...bowlers[bIdx] };
            b.over = Math.max(0, (b.over || 0) - 1);
            b.run = Math.max(0, (b.run || 0) - runDeltaTotal);
            b.wicket = Math.max(0, (b.wicket || 0) - 1);
            if (String(lastTok).includes("nb")) {
              b.noBall = Math.max(0, (b.noBall || 0) - 1);
            }
            b.economy =
              b.over > 0
                ? Math.round((b.run / b.over) * 100) / 100
                : b.run;

            const nextBowlers = [...bowlers];
            nextBowlers[bIdx] = b;
            setBowlers(nextBowlers);
            setBowler({
              id: b.id,
              name: b.name,
              over: b.over,
              maiden: b.maiden ?? 0,
              run: b.run,
              wicket: b.wicket,
              noBall: b.noBall ?? 0,
              wide: b.wide ?? 0,
              economy: b.economy,
            });
            setInputBowler(b.name ?? "");
            setBowlerSaveConfirmed(true);
            setBowlerInputDisabled(true);
            setKeypadAllDisabled(false);
            return;
          }
        }
      }
    }

    if (currentRunStack.length > 0) {
      const last = currentRunStack[currentRunStack.length - 1];
      if (typeof last === "number") {
        console.log("num backup");
        const run = parseInt(last);
        undoRun(run, false);
        /////
        if (inningNo === 2) {
          setRemainingBalls(remainingBalls + 1);
          setRemainingRuns(remainingRuns + run);
        }
        /////
      } else {
        if (typeof last === "string" && last.startsWith("ovw:")) {
          const parts = last.split(":");
          const before = parseInt(parts[1], 10) || 0;
          const after = parseInt(parts[2], 10) || 0;
          const run = before + after;
          setCurrentRunStack(currentRunStack.slice(0, -1));
          undoWicket(false, run);
          if (inningNo === 2) {
            setRemainingBalls(remainingBalls + 1);
          }
          setOverthrowMode(null);
          setOverthrowBaseRun(null);
          return;
        }
        if (typeof last === "string" && last.startsWith("ov:")) {
          const parts = last.split(":");
          const before = parseInt(parts[1], 10) || 0;
          const after = parseInt(parts[2], 10) || 0;
          const run = before + after;
          undoRun(run, false, false, false);
          if (inningNo === 2) {
            setRemainingBalls(remainingBalls + 1);
            setRemainingRuns(remainingRuns + run);
          }
          setOverthrowMode(null);
          setOverthrowBaseRun(null);
          return;
        }

        setCurrentRunStack(currentRunStack.slice(0, -1));
        if (last === "W") {
          console.log("wicket backup");
          undoWicket(false, 0);
          if (inningNo === 2) {
            setRemainingBalls(remainingBalls + 1);
          }
        } else if (typeof last === "string" && /^W\+\d+$/.test(last)) {
          const wr = parseInt(last.slice(2), 10) || 0;
          undoWicket(false, wr);
          if (inningNo === 2) {
            setRemainingBalls(remainingBalls + 1);
          }
        } else if (last === "nb+W") {
          setExtras((state) => ({
            ...state,
            total: state.total - 1,
            noBall: state.noBall - 1,
          }));
          setTotalRuns(totalRuns - 1);
          setRunsByOver(runsByOver - 1);
          if (inningNo === 2) {
            setRemainingRuns(remainingRuns + 1);
          }
          undoWicket(true, 0);
        } else if (last === "nbW") {
          setExtras((state) => ({
            ...state,
            total: state.total - 1,
            noBall: state.noBall - 1,
          }));
          setTotalRuns(totalRuns - 1);
          setRunsByOver(runsByOver - 1);
          if (inningNo === 2) {
            setRemainingRuns(remainingRuns + 1);
          }
          undoWicket(true, 0, {
            creditNbStrikerFaceBall: true,
            reverseNbRunOutOverProgress: true,
          });
        } else if (typeof last === "string" && /^nbW\+\d+$/.test(last)) {
          const wr = parseInt(last.slice(4), 10) || 0;
          setExtras((state) => ({
            ...state,
            total: state.total - 1,
            noBall: state.noBall - 1,
          }));
          setTotalRuns(totalRuns - 1 - wr);
          setRunsByOver(runsByOver - 1 - wr);
          if (inningNo === 2) {
            setRemainingRuns(remainingRuns + wr + 1);
          }
          undoWicket(true, wr, {
            skipRunTotalsAdjust: true,
            creditNbStrikerFaceBall: true,
            reverseNbRunOutOverProgress: true,
          });
        } else if (last === "wdW" || (typeof last === "string" && /^wdW\+\d+$/.test(last))) {
          const wr = typeof last === "string" && /^wdW\+\d+$/.test(last)
            ? parseInt(last.slice(4), 10) || 0
            : 0;
          setExtras((state) => ({
            ...state,
            total: state.total - 1,
            wide: state.wide - 1,
          }));
          setTotalRuns(totalRuns - 1 - wr);
          setRunsByOver(runsByOver - 1 - wr);
          if (inningNo === 2) {
            setRemainingRuns(remainingRuns + wr + 1);
          }
          undoWicket(true, wr, {
            skipRunTotalsAdjust: true,
          });
        } else if (last === "LbW" || (typeof last === "string" && /^LbW\+\d+$/.test(last))) {
          const wr = typeof last === "string" && /^LbW\+\d+$/.test(last)
            ? parseInt(last.slice(4), 10) || 0
            : 0;
          setExtras((state) => ({
            ...state,
            total: state.total - wr,
            Lb: state.Lb - wr,
          }));
          setTotalRuns(totalRuns - wr);
          setRunsByOver(runsByOver - wr);
          if (inningNo === 2) {
            setRemainingRuns(remainingRuns + wr);
            setRemainingBalls(remainingBalls + 1);
          }
          undoWicket(false, wr, {
            skipRunTotalsAdjust: true,
          });
        } else if (last === "ByW" || (typeof last === "string" && /^ByW\+\d+$/.test(last))) {
          const wr = typeof last === "string" && /^ByW\+\d+$/.test(last)
            ? parseInt(last.slice(4), 10) || 0
            : 0;
          setExtras((state) => ({
            ...state,
            total: state.total - wr,
            Bye: (state.Bye || 0) - wr,
          }));
          setTotalRuns(totalRuns - wr);
          setRunsByOver(runsByOver - wr);
          if (inningNo === 2) {
            setRemainingRuns(remainingRuns + wr);
            setRemainingBalls(remainingBalls + 1);
          }
          undoWicket(false, wr, {
            skipRunTotalsAdjust: true,
          });
        } else {
          const firstTwoChars = last.slice(0, 2);
          const run = parseInt(last.substr(last.length - 1));
          if (firstTwoChars === "wd") {
            console.log("Wide backup");
            /////
            if (inningNo === 2) {
              // setRemainingBalls(remainingBalls + 1);
              setRemainingRuns(remainingRuns + run + 1);
            }
            /////
            // setTotalRuns(totalRuns - 1);
            setExtras((state) => ({
              ...state,
              total: state.total - (run + 1),
              wide: state.wide - 1,
              Lb: state.Lb - run,
            }));
            /////
            if (isNaN(run)) {
              setTotalRuns(totalRuns - 1);
              setRunsByOver(runsByOver - 1);
              if (last !== "nb") {
                undoWicket(true);
              }
            } else {
              undoRun(run, false, true, false);
            }
          } else if (firstTwoChars === "Lb") {
            console.log("Legbye backup", run);
            /////
            if (inningNo === 2) {
              setRemainingBalls(remainingBalls + 1);
              setRemainingRuns(remainingRuns + run);
            }
            /////
            setTotalRuns(totalRuns - run);
            setExtras((state) => ({
              ...state,
              total: state.total - run,
              Lb: state.Lb - run,
            }));
            /////
            if (isNaN(run)) {
              setTotalRuns(totalRuns - run);
              setRunsByOver(runsByOver - run);
            } else {
              undoRun(run, false, false, true);
            }
          } else if (firstTwoChars === "By") {
            console.log("Bye backup", run);
            if (inningNo === 2) {
              setRemainingBalls(remainingBalls + 1);
              setRemainingRuns(remainingRuns + run);
            }
            setTotalRuns(totalRuns - run);
            setExtras((state) => ({
              ...state,
              total: state.total - run,
              Bye: (state.Bye || 0) - run,
            }));
            if (isNaN(run)) {
              setTotalRuns(totalRuns - run);
              setRunsByOver(runsByOver - run);
            } else {
              undoRun(run, false, false, true);
            }
          } else {
            console.log("No ball backup");
            /////
            if (inningNo === 2) {
              // setRemainingBalls(remainingBalls + 1);
              if (isNaN(run)) {
                setRemainingRuns(remainingRuns + 1);
              } else {
                setRemainingRuns(remainingRuns + run + 1);
              }
            }
            /////
            // setTotalRuns(totalRuns - 1);
            setExtras((state) => ({
              ...state,
              total: state.total - 1,
              noBall: state.noBall - 1,
            }));
            /////
            if (isNaN(run)) {
              setTotalRuns(totalRuns - 1);
              setRunsByOver(runsByOver - 1);
              if (last !== "nb") {
                undoWicket(true);
              }
            } else {
              undoRun(run, true, false, false);
            }
          }
        }
      }
    }
  };

  // Strick Rotation
  const handleStrikeChange = (e) => {
    changeStrikeRadio(e.target.value);
    if (e.target.value === "strike") {
      switchBatterStrike("batter1");
    } else {
      switchBatterStrike("batter2");
    }
  };

  // Strick Rotation
  const changeStrikeRadio = (strikeParam) => {
    if (strikeParam === undefined) {
      setStrikeValue(strikeValue === "strike" ? "non-strike" : "strike");
    } else {
      setStrikeValue(strikeParam);
    }
  };

  // Strick Rotation
  const switchBatterStrike = (strikeParam) => {
    if (strikeParam === undefined) {
      setBatter1((state) => ({
        ...state,
        onStrike: !state.onStrike,
      }));
      setBatter2((state) => ({
        ...state,
        onStrike: !state.onStrike,
      }));
    } else {
      if (strikeParam === "batter1") {
        setBatter1((state) => ({
          ...state,
          onStrike: true,
        }));
        setBatter2((state) => ({
          ...state,
          onStrike: false,
        }));
      } else if (strikeParam === "batter2") {
        setBatter1((state) => ({
          ...state,
          onStrike: false,
        }));
        setBatter2((state) => ({
          ...state,
          onStrike: true,
        }));
      }
    }
  };

  const handleRun = (run) => {
    if (!keypadBaseReady || keypadAllDisabled) return;
    const isOverthrowSelection = overthrowMode === "before";
    const isOverthrowFinal = overthrowMode === "after" && overthrowBaseRun != null;

    if (isOverthrowSelection) {
      setOverthrowBaseRun(run);
      setOverthrowMode("after");
      return;
    }

    const runToAdd = isOverthrowFinal ? overthrowBaseRun + run : run;
    const overthrowToken = isOverthrowFinal ? `ov:${overthrowBaseRun}:${run}` : null;
    if (isNoBall) {
      console.log("No");
      setCurrentRunStack((state) => [...state, "nb" + runToAdd]);
      removeNoBallEffect();
    } else if (iswideball) {
      console.log("wide");
      setCurrentRunStack((state) => [...state, "wd" + runToAdd]);
      removeWideBallEffect();
    } else if (isLb || isBye) {
      console.log("Legby");
      setExtras((state) => ({
        ...state,
        total: state.total + runToAdd,
        ...(isBye
          ? { Bye: (state.Bye || 0) + runToAdd }
          : { Lb: state.Lb + runToAdd }),
      }));
      setBallCount(ballCount + 1);
      setCurrentRunStack((state) => [...state, (isBye ? "By" : "Lb") + runToAdd]);
      if (isBye) {
        removeByeEffect();
      } else {
        removeLbEffect();
      }
    } else {
      console.log("simple");
      setBallCount(ballCount + 1);
      setCurrentRunStack((state) => [...state, overthrowToken ?? runToAdd]);
    }

    setTotalRuns(totalRuns + runToAdd);
    setRunsByOver(runsByOver + runToAdd);

    if (inningNo === 2) {
      if (!isNoBall && !iswideball) {
        setRemainingBalls(remainingBalls - 1);
      }
      setRemainingRuns(remainingRuns - runToAdd);
    }

    /////////
    if (iswideball) {
      console.log("Legby");
      setExtras((state) => ({
        ...state,
        total: state.total + runToAdd,
        Lb: state.Lb + runToAdd,
      }));
    }

    if (ballCount === 5) {
      if (isNoBall || iswideball) {
        if (runToAdd % 2 !== 0) {
          changeStrikeRadio();
        }
      } else {
        setTotalOvers(overCount + 1);
        const arr = [...currentRunStack];
        arr.push(overthrowToken ?? runToAdd);
        overCompleted(runsByOver + runToAdd, arr);
        if (runToAdd % 2 === 0) {
          changeStrikeRadio();
        }
      }
    } else {
      if (!isNoBall && !iswideball) {
        setTotalOvers(Math.round((totalOvers + 0.1) * 10) / 10);
      }

      if (runToAdd % 2 !== 0) {
        changeStrikeRadio();
      }
    }

    if (batter1.onStrike) {
      setBatter1((state) => {
        const updatedRun =
          !isLb && !isBye && !iswideball ? state.run + runToAdd : state.run;
        var updatedBall =
          !isNoBall && !iswideball ? state.ball + 1 : state.ball;
        // const updatedBall = state.ball + 1
        const sr =
          updatedBall > 0
            ? Math.round((updatedRun / updatedBall) * 100 * 100) / 100
            : 0;
        let four = state.four;
        if (runToAdd === 4) {
          four =
            !isLb && !isBye && !iswideball && !isOverthrowFinal
              ? four + 1
              : four;
        }
        let six = state.six;
        if (runToAdd === 6) {
          six =
            !isLb && !isBye && !iswideball && !isOverthrowFinal
              ? six + 1
              : six;
        }
        return {
          ...state,
          run: updatedRun,
          ball: updatedBall,
          four: four,
          six: six,
          strikeRate: sr,
        };
      });
      if (isNoBall) {
        if (runToAdd % 2 !== 0) {
          switchBatterStrike();
        }
      } else {
        if (
          (ballCount === 5 && runToAdd % 2 === 0) ||
          (ballCount !== 5 && runToAdd % 2 !== 0)
        ) {
          switchBatterStrike();
        }
      }
    } else {
      setBatter2((state) => {
        const updatedRun =
          !isLb && !isBye && !iswideball ? state.run + runToAdd : state.run;
        var updatedBall =
          !isNoBall && !iswideball ? state.ball + 1 : state.ball;

        // const updatedBall = state.ball + 1
        const sr =
          updatedBall > 0
            ? Math.round((updatedRun / updatedBall) * 100 * 100) / 100
            : 0;
        let four = state.four;
        if (runToAdd === 4) {
          four =
            !isLb && !isBye && !iswideball && !isOverthrowFinal
              ? four + 1
              : four;
        }
        let six = state.six;
        if (runToAdd === 6) {
          six =
            !isLb && !isBye && !iswideball && !isOverthrowFinal
              ? six + 1
              : six;
        }
        return {
          ...state,
          run: updatedRun,
          ball: updatedBall,
          four: four,
          six: six,
          strikeRate: sr,
        };
      });
      if (
        (ballCount === 5 && runToAdd % 2 === 0) ||
        (ballCount !== 5 && runToAdd % 2 !== 0)
      ) {
        switchBatterStrike();
      }
    }
    if (isOverthrowFinal) {
      setOverthrowMode(null);
      setOverthrowBaseRun(null);
    }
  };

  const handleNoBall = () => {
    if (
      !keypadBaseReady ||
      keypadAllDisabled ||
      keypadActiveDisabled ||
      keypadActive1Disabled
    ) {
      return;
    }
    if (isNoBall === false && iswideball === false && isLb === false && isBye === false) {
      if (inningNo === 2) {
        setRemainingRuns(remainingRuns - 1);
      }
      setTotalRuns(totalRuns + 1);
      setRunsByOver(runsByOver + 1);
      setExtras((state) => ({
        ...state,
        total: state.total + 1,
        noBall: state.noBall + 1,
      }));
    }
    addNoBallEffect();
  };

  const addNoBallEffect = () => {
    setNoBallVisualOnInactive(true);
    setTimeout(() => {
      setKeypadActiveDisabled(true);
    }, 0);

    setNoBall(true);
  };

  const removeNoBallEffect = () => {
    setNoBallVisualOnInactive(false);
    setKeypadActiveDisabled(false);
    setNoBall(false);
  };

  const handleWide = () => {
    if (isNoBall) {
      if (!keypadBaseReady || keypadAllDisabled) return;
      setCurrentRunStack((state) => [...state, "nb"]);
      removeNoBallEffect();
      return;
    }
    if (
      !keypadBaseReady ||
      keypadAllDisabled ||
      keypadActiveDisabled ||
      keypadActive1Disabled
    ) {
      return;
    }
    if (inningNo === 2) {
      setRemainingRuns(remainingRuns - 1);
    }
    // setCurrentRunStack((state) => [...state, 'wd'])
    setTotalRuns(totalRuns + 1);
    setRunsByOver(runsByOver + 1);
    setExtras((state) => ({
      ...state,
      total: state.total + 1,
      wide: state.wide + 1,
    }));
    addWideBallEffect();
  };

  const addWideBallEffect = () => {
    setWideLbVisualOnInactive1(true);
    setTimeout(() => {
      setKeypadActive1Disabled(true);
    }, 0);
    setwideBall(true);
  };

  const removeWideBallEffect = () => {
    setWideLbVisualOnInactive1(false);
    setKeypadActive1Disabled(false);
    setwideBall(false);
  };

  //////
  const handleLb = () => {
    if (isNoBall) {
      if (!keypadBaseReady || keypadAllDisabled) return;
      setCurrentRunStack((state) => [...state, "nb"]);
      removeNoBallEffect();
      return;
    }
    if (
      !keypadBaseReady ||
      keypadAllDisabled ||
      keypadActiveDisabled ||
      keypadActive1Disabled
    ) {
      return;
    }
    addLbEffect();
  };

  const addLbEffect = () => {
    setWideLbVisualOnInactive1(true);
    setTimeout(() => {
      setKeypadActive1Disabled(true);
    }, 0);
    setLb(true);
  };

  const removeLbEffect = () => {
    setWideLbVisualOnInactive1(false);
    setKeypadActive1Disabled(false);
    setLb(false);
  };
  const handleBye = () => {
    if (isNoBall) {
      if (!keypadBaseReady || keypadAllDisabled) return;
      setCurrentRunStack((state) => [...state, "nb"]);
      removeNoBallEffect();
      return;
    }
    if (
      !keypadBaseReady ||
      keypadAllDisabled ||
      keypadActiveDisabled ||
      keypadActive1Disabled
    ) {
      return;
    }
    addByeEffect();
  };

  const addByeEffect = () => {
    setWideLbVisualOnInactive1(true);
    setTimeout(() => {
      setKeypadActive1Disabled(true);
    }, 0);
    setBye(true);
  };

  const removeByeEffect = () => {
    setWideLbVisualOnInactive1(false);
    setKeypadActive1Disabled(false);
    setBye(false);
  };
  const handleOverthrowMode = () => {
    if (
      !keypadBaseReady ||
      keypadAllDisabled ||
      isNoBall ||
      iswideball ||
      isLb ||
      isBye ||
      overthrowMode
    ) {
      return;
    }
    setOverthrowBaseRun(null);
    setOverthrowMode("before");
  };
  //////
  /** Runs before run-out on this ball; ball already counted via handleCurrentBall(0) when W opens. */
  const applyRunOutCompletedRunsToBatter = (b, runs) => {
    if (!b || b.name == null || !runs) return { ...b };
    const run = (b.run || 0) + runs;
    const ball = b.ball || 0;
    let four = b.four || 0;
    if (runs === 4) four += 1;
    const strikeRate =
      ball > 0 ? Math.round((run / ball) * 100 * 100) / 100 : 0;
    return { ...b, run, ball, four, strikeRate };
  };

  /** No-ball run-out: credit runs (0–4) to striker and count one ball on their account. */
  const applyNbRunOutRunsOnly = (b, runs) => {
    if (!b || b.name == null) return { ...b };
    const r = Math.min(4, Math.max(0, Number(runs) || 0));
    const run = (b.run || 0) + r;
    const ball = (b.ball || 0) + 1;
    let four = b.four || 0;
    if (r === 4) four += 1;
    const strikeRate =
      ball > 0 ? Math.round((run / ball) * 100 * 100) / 100 : 0;
    return { ...b, run, ball, four, strikeRate };
  };

  /** After `nb`+runs on stack then run-out: runs already credited; add one ball to striker. */
  const applyNbRunOutBallOnly = (b) => {
    if (!b || b.name == null) return { ...b };
    const ball = (b.ball || 0) + 1;
    const run = b.run || 0;
    const strikeRate =
      ball > 0 ? Math.round((run / ball) * 100 * 100) / 100 : 0;
    return { ...b, ball, strikeRate };
  };

  /** Custom: hit out of ground — `nb+W` if no-ball, else `W` (striker out). */
  const handleOutOfGroundWicket = () => {
    setRunOutPlayerId("");
    const token = isNoBall ? "nb+W" : "W";

    if (isNoBall) {
      removeNoBallEffect();
      setCurrentRunStack((state) => [...state, token]);
      setWicketCount(wicketCount + 1);
      setKeypadAllDisabled(true);
    } else if (ballCount === 5) {
      setTotalOvers(overCount + 1);
      const arr = [...currentRunStack, token];
      overCompleted(runsByOver, arr);
      setWicketCount(wicketCount + 1);
      setKeypadAllDisabled(true);
    } else {
      setBallCount(ballCount + 1);
      setCurrentRunStack((state) => [...state, token]);
      setTotalOvers(Math.round((totalOvers + 0.1) * 10) / 10);
      setWicketCount(wicketCount + 1);
      setKeypadAllDisabled(true);
    }

    if (batter1.onStrike) {
      newBatter1();
    } else {
      newBatter2();
    }

    if (wicketCount + 1 === TotalWicket) {
      setBowlerInputDisabled(true);
      setBatter1InputDisabled(true);
      setBatter2InputDisabled(true);
      setInputBowler("");
      setBatter1SaveConfirmed(false);
      setBatter2SaveConfirmed(false);
      setBowlerSaveConfirmed(false);
    }
  };

  const handleWicket = (isRunOut, playerId, runOutCompletedRunsParam = 0) => {
    setRunOutPlayerId("");
    const nRaw = Math.max(0, Number(runOutCompletedRunsParam) || 0);

    const lastTok =
      currentRunStack.length > 0
        ? currentRunStack[currentRunStack.length - 1]
        : null;
    const nbStackMatch =
      typeof lastTok === "string" ? lastTok.match(/^nb(\d+)$/) : null;
    const isCompositeNbRunOut = Boolean(
      isRunOut && nbStackMatch && !isNoBall,
    );
    const runOutFromWide = isRunOut && iswideball;
    const runOutFromLb = isRunOut && isLb;
    const runOutFromBye = isRunOut && isBye;

    const runsAddLegal =
      !isNoBall &&
      !iswideball &&
      !isLb &&
      !isBye &&
      !isCompositeNbRunOut &&
      isRunOut &&
      nRaw > 0
        ? nRaw
        : 0;
    const runsAddNbModal = isNoBall && isRunOut && nRaw > 0 ? nRaw : 0;
    const runsAddWdModal = runOutFromWide && nRaw > 0 ? nRaw : 0;
    const runsAddLbModal = runOutFromLb && nRaw > 0 ? nRaw : 0;
    const runsAddByeModal = runOutFromBye && nRaw > 0 ? nRaw : 0;
    const overthrowRunOutActive =
      isRunOut && overthrowMode === "after" && overthrowBaseRun != null;
    const overthrowBeforeRuns = overthrowRunOutActive
      ? Math.max(0, Number(overthrowBaseRun) || 0)
      : 0;
    const overthrowAfterRuns = overthrowRunOutActive ? nRaw : 0;
    const overthrowRunOutTotal = overthrowBeforeRuns + overthrowAfterRuns;

    const legalWicketToken = overthrowRunOutActive
      ? `ovw:${overthrowBeforeRuns}:${overthrowAfterRuns}`
      : runOutFromWide
        ? (nRaw > 0 ? `wdW+${nRaw}` : "wdW")
        : runOutFromLb
          ? (nRaw > 0 ? `LbW+${nRaw}` : "LbW")
          : runOutFromBye
            ? (nRaw > 0 ? `ByW+${nRaw}` : "ByW")
      : isRunOut && runsAddLegal > 0
        ? `W+${runsAddLegal}`
        : "W";

    const nbRunOutStackToken = (() => {
      if (isRunOut && isNoBall) {
        return nRaw > 0 ? `nbW+${nRaw}` : "nbW";
      }
      if (isCompositeNbRunOut) {
        const ns = parseInt(nbStackMatch[1], 10) || 0;
        return ns > 0 ? `nbW+${ns}` : "nbW";
      }
      return "nbW";
    })();

    const strikerIsBatter1 =
      strikeValue === "strike"
        ? true
        : strikeValue === "non-strike"
          ? false
          : Boolean(batter1.onStrike);

    let b1ForOut = { ...batter1 };
    let b2ForOut = { ...batter2 };
    if (overthrowRunOutActive) {
      if (strikerIsBatter1) {
        b1ForOut = applyRunOutCompletedRunsToBatter(
          batter1,
          overthrowRunOutTotal,
        );
      } else {
        b2ForOut = applyRunOutCompletedRunsToBatter(
          batter2,
          overthrowRunOutTotal,
        );
      }
    } else if (runsAddLegal > 0) {
      if (strikerIsBatter1) {
        b1ForOut = applyRunOutCompletedRunsToBatter(batter1, runsAddLegal);
      } else {
        b2ForOut = applyRunOutCompletedRunsToBatter(batter2, runsAddLegal);
      }
    } else if (isNoBall && isRunOut) {
      if (strikerIsBatter1) {
        b1ForOut = applyNbRunOutRunsOnly(batter1, nRaw);
      } else {
        b2ForOut = applyNbRunOutRunsOnly(batter2, nRaw);
      }
    }
    if (isCompositeNbRunOut) {
      if (strikerIsBatter1) {
        b1ForOut = applyNbRunOutBallOnly(batter1);
      } else {
        b2ForOut = applyNbRunOutBallOnly(batter2);
      }
    }

    const strikerDismissedRunOut =
      isRunOut &&
      String(playerId) ===
        String(strikerIsBatter1 ? batter1.id : batter2.id);

    const runsForTotals = overthrowRunOutActive
      ? overthrowRunOutTotal
      : runsAddLegal ||
        runsAddNbModal ||
        runsAddWdModal ||
        runsAddLbModal ||
        runsAddByeModal;
    if (runsForTotals > 0) {
      setTotalRuns(totalRuns + runsForTotals);
      if (ballCount !== 5) {
        setRunsByOver(runsByOver + runsForTotals);
      }
      if (inningNo === 2) {
        setRemainingRuns(remainingRuns - runsForTotals);
      }
      if (!strikerDismissedRunOut) {
        if (strikerIsBatter1) setBatter1(b1ForOut);
        else setBatter2(b2ForOut);
      }
    }
    if (isCompositeNbRunOut && !strikerDismissedRunOut) {
      if (strikerIsBatter1) setBatter1(b1ForOut);
      else setBatter2(b2ForOut);
    }
    if (isNoBall && isRunOut && !isCompositeNbRunOut && !strikerDismissedRunOut) {
      if (strikerIsBatter1) setBatter1(b1ForOut);
      else setBatter2(b2ForOut);
    }
    if (isLb && isRunOut) {
      removeLbEffect();
    }
    if (isBye && isRunOut) {
      removeByeEffect();
    }

    if (isCompositeNbRunOut) {
      const stackPrefix = currentRunStack.slice(0, -1);
      const tok = nbRunOutStackToken;
      if (ballCount === 5) {
        if (inningNo === 2) {
          setRemainingBalls((b) => b - 1);
        }
        setTotalOvers(overCount + 1);
        overCompleted(
          runsByOver + runsAddNbModal,
          [...stackPrefix, tok],
        );
        setWicketCount(wicketCount + 1);
        setKeypadAllDisabled(true);
      } else {
        if (inningNo === 2) {
          setRemainingBalls((b) => b - 1);
        }
        setBallCount(ballCount + 1);
        setTotalOvers(Math.round((totalOvers + 0.1) * 10) / 10);
        setCurrentRunStack([...stackPrefix, tok]);
        setWicketCount(wicketCount + 1);
        setKeypadAllDisabled(true);
      }
    } else if (ballCount === 5) {
      if (isNoBall) {
        removeNoBallEffect();
        if (isRunOut) {
          if (inningNo === 2) {
            setRemainingBalls((b) => b - 1);
          }
          setTotalOvers(overCount + 1);
          const arr = [...currentRunStack, nbRunOutStackToken];
          overCompleted(runsByOver + runsAddNbModal, arr);
          setWicketCount(wicketCount + 1);
          setKeypadAllDisabled(true);
        } else {
          setCurrentRunStack((state) => [...state, "nb"]);
        }
      } else if (iswideball) {
        removeWideBallEffect();
        if (isRunOut) {
          const arr = [...currentRunStack, legalWicketToken];
          overCompleted(runsByOver + runsForTotals, arr);
          setWicketCount(wicketCount + 1);
          setKeypadAllDisabled(true);
        } else {
          setCurrentRunStack((state) => [...state, "wd"]);
        }
      } else {
        setTotalOvers(overCount + 1);
        const arr = [...currentRunStack];
        arr.push(legalWicketToken);
        overCompleted(runsByOver + runsForTotals, arr);
        setWicketCount(wicketCount + 1);
        setKeypadAllDisabled(true);
      }
    } else {
      if (isNoBall) {
        removeNoBallEffect();
        if (isRunOut) {
          if (inningNo === 2) {
            setRemainingBalls((b) => b - 1);
          }
          setBallCount(ballCount + 1);
          setTotalOvers(Math.round((totalOvers + 0.1) * 10) / 10);
          setCurrentRunStack((state) => [...state, nbRunOutStackToken]);
          setWicketCount(wicketCount + 1);
          setKeypadAllDisabled(true);
        } else {
          setCurrentRunStack((state) => [...state, "nb"]);
        }
      } else if (iswideball) {
        removeWideBallEffect();
        if (isRunOut) {
          setCurrentRunStack((state) => [...state, legalWicketToken]);
          setWicketCount(wicketCount + 1);
          setKeypadAllDisabled(true);
        } else {
          setCurrentRunStack((state) => [...state, "wd"]);
        }
      } else {
        setBallCount(ballCount + 1);
        setCurrentRunStack((state) => [...state, legalWicketToken]);
        setTotalOvers(Math.round((totalOvers + 0.1) * 10) / 10);
        setWicketCount(wicketCount + 1);
        setKeypadAllDisabled(true);
      }
    }
    if (isRunOut) {
      if (String(batter1.id) === String(playerId)) {
        setBatter1SaveConfirmed(false);
        setBatter1InputDisabled(false);
        const out = b1ForOut;
        setBatters((state) => [
          ...state,
          {
            id: out.id,
            name: out.name,
            run: out.run,
            ball: out.ball,
            four: out.four,
            six: out.six,
            strikeRate: out.strikeRate,
            onStrike: out.onStrike,
            battingOrder: out.battingOrder,
            battingStatus: OUT,
          },
        ]);
        setBatter1({});
        changeStrikeRadio("strike");
        switchBatterStrike("batter1");
      } else {
        setBatter2SaveConfirmed(false);
        setBatter2InputDisabled(false);
        const out = b2ForOut;
        setBatters((state) => [
          ...state,
          {
            id: out.id,
            name: out.name,
            run: out.run,
            ball: out.ball,
            four: out.four,
            six: out.six,
            strikeRate: out.strikeRate,
            onStrike: out.onStrike,
            battingOrder: out.battingOrder,
            battingStatus: OUT,
          },
        ]);
        setBatter2({});
        changeStrikeRadio("non-strike");
        switchBatterStrike("batter2");
      }
    } else {
      if (!isNoBall) {
        if (batter1.onStrike) {
          newBatter1();
        } else {
          newBatter2();
        }
      }
    }
    if (isNoBall) {
      if (isRunOut && wicketCount + 1 === TotalWicket) {
        setBowlerInputDisabled(true);
        setBatter1InputDisabled(true);
        setBatter2InputDisabled(true);
        setInputBowler("");
        setBatter1SaveConfirmed(false);
        setBatter2SaveConfirmed(false);
        setBowlerSaveConfirmed(false);
      }
    } else {
      if (wicketCount + 1 === TotalWicket) {
        setBowlerInputDisabled(true);
        setBatter1InputDisabled(true);
        setBatter2InputDisabled(true);
        setInputBowler("");
        setBatter1SaveConfirmed(false);
        setBatter2SaveConfirmed(false);
        setBowlerSaveConfirmed(false);
      }
    }
    if (overthrowRunOutActive) {
      setOverthrowMode(null);
      setOverthrowBaseRun(null);
    }
  };

  const handleCloseModal = () => {
    if (outType !== "") {
      if (outType === RUN_OUT) {
        if (runOutPlayerId !== "") {
          handleWicket(true, runOutPlayerId, runOutCompletedRuns);
        }
      } else if (outType === OUT_OF_GROUND) {
        handleOutOfGroundWicket();
      } else {
        handleWicket(false, "");
      }
    }
    setModalOpen(false);
    setOutType("");
    setRunOutPlayerId("");
    setRunOutCompletedRuns(0);
    setRunOutPlayerUiVisible(false);
    setRunOutPlayerErrorVisible(false);
  };

  /** Clear wicket type + run-out selection only; keep modal open. */
  const handleWicketModalClear = () => {
    setOutType("");
    setRunOutPlayerId("");
    setRunOutCompletedRuns(0);
    setRunOutPlayerUiVisible(false);
    setRunOutPlayerErrorVisible(false);
  };

  /** Confirm wicket (if selected) and close — same as previous modal close behavior. */
  const handleWicketModalDone = () => {
    if (
      (overthrowMode === "after" || iswideball || isLb || isBye) &&
      outType !== RUN_OUT
    ) {
      return;
    }
    if (!wicketModalOkEnabled) return;
    handleCloseModal();
  };

  /** Backdrop / Escape: close without recording a wicket (only after a wicket type is selected). */
  const handleWicketModalDismiss = () => {
    if (outType === "") return;
    setModalOpen(false);
    setOutType("");
    setRunOutPlayerId("");
    setRunOutCompletedRuns(0);
    setRunOutPlayerUiVisible(false);
    setRunOutPlayerErrorVisible(false);
  };

  const handleOutTypeChange = (e) => {
    const outTypeValue = e.target.value;
    if (
      (overthrowMode === "after" || iswideball || isLb || isBye) &&
      outTypeValue !== RUN_OUT
    ) {
      return;
    }
    setOutType(outTypeValue);
    if (outTypeValue === RUN_OUT) {
      setRunOutPlayerUiVisible(true);
      setRunOutPlayerErrorVisible(true);
    } else if (outTypeValue === OUT_OF_GROUND) {
      setRunOutPlayerUiVisible(false);
      setRunOutPlayerErrorVisible(false);
      setRunOutCompletedRuns(0);
    } else {
      setRunOutCompletedRuns(0);
    }
  };

  const handleRunOutPlayerChange = (e) => {
    const playerId = e.target.value;
    setRunOutPlayerErrorVisible(false);
    setRunOutPlayerId(playerId);
  };

  useEffect(() => {
    if (inningNo !== 2) {
      chaseResultKeypadLockedRef.current = false;
    }
  }, [inningNo]);

  useEffect(() => {
    if (inningNo !== 2) return;
    const trg = (match?.inning1?.runs ?? 0) + 1;
    const chaseStarted =
      totalRuns > 0 ||
      overCount > 0 ||
      ballCount > 0 ||
      wicketCount > 0;
    const wonChasing =
      chaseStarted &&
      wicketCount < TotalWicket &&
      overCount <= maxOver &&
      totalRuns >= trg;
    const wonBowling =
      chaseStarted &&
      (wicketCount >= TotalWicket || overCount >= maxOver) &&
      totalRuns < trg - 1;
    const tied =
      chaseStarted &&
      wicketCount < TotalWicket &&
      overCount === maxOver &&
      totalRuns === trg - 1;
    if (wonChasing || wonBowling || tied) {
      chaseResultKeypadLockedRef.current = true;
      setKeypadAllDisabled(true);
    }
  }, [
    inningNo,
    wicketCount,
    overCount,
    ballCount,
    totalRuns,
    TotalWicket,
    maxOver,
    match?.inning1?.runs,
  ]);

  useEffect(() => {
    const nbModeActive = isNoBall === true;
    const wdLbByeModeActive = iswideball === true || isLb === true || isBye === true;
    setKeypadActiveDisabled(nbModeActive);
    setNoBallVisualOnInactive(nbModeActive);
    setKeypadActive1Disabled(wdLbByeModeActive);
    setWideLbVisualOnInactive1(wdLbByeModeActive);
  }, [isNoBall, iswideball, isLb, isBye]);

  useEffect(() => {
    if (chaseResultKeypadLockedRef.current) return;
    const allPlayerFieldsSaved =
      batter1SaveConfirmed &&
      batter2SaveConfirmed &&
      bowlerSaveConfirmed &&
      batter1InputDisabled &&
      batter2InputDisabled &&
      bowlerInputDisabled &&
      String(batter1?.name ?? "").trim() !== "" &&
      String(batter2?.name ?? "").trim() !== "" &&
      Boolean(bowler?.id) &&
      String(inputBowler ?? "").trim() !== "";
    if (allPlayerFieldsSaved) {
      setKeypadAllDisabled(false);
      setKeypadActiveDisabled(isNoBall === true);
      setKeypadActive1Disabled(
        iswideball === true || isLb === true || isBye === true,
      );
    }
  }, [
    batter1SaveConfirmed,
    batter2SaveConfirmed,
    bowlerSaveConfirmed,
    batter1InputDisabled,
    batter2InputDisabled,
    bowlerInputDisabled,
    batter1?.name,
    batter2?.name,
    bowler?.id,
    inputBowler,
    isNoBall,
    iswideball,
    isLb,
    isBye,
    /** Wicket / undo-wicket: `handleWicket` forces keypad off; deps above may not change, so re-run unlock when count changes. */
    wicketCount,
  ]);

  const numScoreButtonsDisabled = !keypadBaseReady || keypadAllDisabled;
  const ovModeActive = overthrowMode === "before" || overthrowMode === "after";
  const ovNumberBtnClass =
    overthrowMode === "before"
      ? " score-types-button-overthrow-before"
      : overthrowMode === "after"
        ? " score-types-button-overthrow-after"
        : "";

  const nbWdLbDisabled =
    !keypadBaseReady ||
    keypadAllDisabled ||
    keypadActiveDisabled ||
    keypadActive1Disabled ||
    ovModeActive;

  const wDisabled =
    !keypadBaseReady ||
    keypadAllDisabled ||
    (keypadActive1Disabled && !iswideball && !isLb && !isBye) ||
    overthrowMode === "before";
  const ovDisabled =
    !keypadBaseReady ||
    keypadAllDisabled ||
    ovModeActive ||
    isNoBall ||
    iswideball ||
    isLb ||
    isBye;

  const numberNoballClass =
    noBallVisualOnInactive || wideLbVisualOnInactive1
      ? " score-types-button-noball"
      : "";

  const wNoballClass =
    noBallVisualOnInactive || iswideball || isLb || isBye
      ? " score-types-button-noball"
      : "";
  const wOverthrowClass =
    overthrowMode === "after" ? " score-types-button-overthrow-after" : "";
  const runOutOnlyOverthrow =
    overthrowMode === "after" || iswideball || isLb || isBye;

  const batter1SaveBtnClass =
    batter1InputDisabled &&
    batter1?.name?.trim?.() &&
    batter1SaveConfirmed
      ? "player-field-save player-field-save--ok"
      : "player-field-save player-field-save--warn";
  const batter2SaveBtnClass =
    batter2InputDisabled &&
    batter2?.name?.trim?.() &&
    batter2SaveConfirmed
      ? "player-field-save player-field-save--ok"
      : "player-field-save player-field-save--warn";
  const bowlerSaveBtnClass =
    bowlerInputDisabled &&
    bowler?.id &&
    String(inputBowler ?? "").trim()
      ? "player-field-save player-field-save--ok"
      : "player-field-save player-field-save--warn";

  const endInningButtonDisplayLabel = getEndInningButtonLabel();

  const chaseSealedForRrr =
    inningNo === 2 &&
    (hasMatchEnded ||
      remainingRuns <= 0 ||
      totalRuns >= (Number(match.inning1?.runs) || 0) + 1);
  let rrr = chaseSealedForRrr
    ? "0.00"
    : (remainingRuns / (remainingBalls / 6)).toFixed(2);
  rrr = isFinite(rrr) ? rrr : 0;
  const overs = overCount + ballCount / 6;
  let crr = (totalRuns / overs).toFixed(2);
  crr = isFinite(crr) ? crr : 0;

  const inning1 = {
    runs: 0,
    wickets: 0,
    overs: 0,
    batters: [],
    bowlers: [],
    extras: {},
    recentOvers: [],
    ...(match.inning1 || {}),
  };
  const inning2 = {
    runs: 0,
    wickets: 0,
    overs: 0,
    batters: [],
    bowlers: [],
    extras: {},
    recentOvers: [],
    ...(match.inning2 || {}),
  };

  const scoringTeam = batting === team1 ? team1 : team2;
  const chessingTeam = scoringTeam === team1 ? team2 : team1;

  const remRunsDisplay = Math.max(0, Number(remainingRuns) || 0);
  let winningMessage = `${
    inningNo === 1 ? scoringTeam : chessingTeam
  } needs ${remRunsDisplay} ${
    remRunsDisplay <= 1 ? "run" : "runs"
  } in ${remainingBalls} ${remainingBalls <= 1 ? "ball" : "balls"} to win`;

  var target = inningNo === 2 ? (inning1.runs ?? 0) + 1 : 0;
  if (inningNo === 2) {
    winningMessage = buildSecondInningsNoticeMessage({
      inningNo: 2,
      inning1: match.inning1,
      inning2: match.inning2,
      maxOver,
      totalWicket: TotalWicket,
      scoringTeam,
      chessingTeam,
      totalRuns,
      wicketCount,
      overCount,
      hasMatchEnded,
      remainingRuns,
      remainingBalls,
    });
  }

  const updateLiveMatch = useCallback(async () => {
    try {
      const countRes = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/live/count`,
      );

      if (!countRes.ok) {
        console.error(
          `Failed to fetch match count: ${countRes.status} ${countRes.statusText}`,
        );
        return;
      }

      const countData = await countRes.json();
      const count = countData.count || 0;

      if (count === 0) {
        console.warn("No live match entries found. Skipping update.");
        return;
      }

      const matchId = parseInt(count, 10);

      if (isNaN(matchId)) {
        console.warn("Invalid match ID derived from count:", count);
        return;
      }

      const updatePayload = {
        inningNo,
        totalRuns,
        wicketCount,
        totalOvers,
        scoringTeam: scoringTeam,
        chessingTeam: chessingTeam,
        overCount,
        ballCount,
        hasMatchEnded,
        remainingRuns,
        remainingBalls,
        batter1,
        batter2,
        bowler,
        bowlers,
        extras,
        recentOvers: mapRecentOversForDb(recentOvers),
        inning1: {
          ...match.inning1,
          recentOvers: mapRecentOversForDb(match?.inning1?.recentOvers),
        },
        inning2: {
          ...match.inning2,
          recentOvers: mapRecentOversForDb(match?.inning2?.recentOvers),
        },
      };

      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/live/match/${matchId}/update`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatePayload),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        console.error("Error updating match:", result.message || result);
      } else {
        console.log("Match updated successfully:", result);
      }
    } catch (err) {
      console.error("Error in updateLiveMatch:", err.message || err);
    }
  }, [
    inningNo,
    totalRuns,
    wicketCount,
    totalOvers,
    scoringTeam,
    chessingTeam,
    overCount,
    ballCount,
    hasMatchEnded,
    remainingRuns,
    remainingBalls,
    batter1,
    batter2,
    bowler,
    bowlers,
    extras,
    recentOvers,
    match.inning1,
    match.inning2,
    mapRecentOversForDb,
  ]);

  const tossContent = (
    <>
      {matchData && (
        <p>
          {matchData.tossWinner} won the toss & chose {matchData.decision}
        </p>
      )}
      {/* <p>
      {tossWinner} won the toss & chose {decision}
    </p> */}
    </>
  );

  // Notice
  const welcomeContent = (
    <>
      <div></div>
      <div>Welcome to {info?.series}</div>
      <div></div>
    </>
  );

  // Notice overCount === maxOver wicketCount === 10 cnd for innning completed
  const firstInningCompletedContent = (
    <>
      {overCount === maxOver && <div>1st inning completed</div>}
      {wicketCount === TotalWicket && <div>All Out</div>}
      <div>Please click "END INNING" button</div>
    </>
  );

  const firstInningCompletedContent1 = (
    <>
      {liveData && matchData && liveData.overCount === matchData.maxOver && (
        <div>1st inning completed</div>
      )}
      <div>Innings break</div>
    </>
  );

  // Notice
  const remainingRunsContent = (
    <>
      <div>Target: {target}</div>
      <div>{winningMessage}</div>
      <div>RRR: {isNaN(rrr) ? 0 : rrr}</div>
    </>
  );

  const liveViewerWinningLine =
    liveData && matchData && liveData.inningNo === 2
      ? buildSecondInningsNoticeMessage({
          inningNo: liveData.inningNo,
          inning1: liveData.inning1,
          inning2: liveData.inning2,
          maxOver:
            parseInt(
              String(matchData.maxOver ?? liveData.totalOvers ?? "20"),
              10,
            ) || 20,
          totalWicket: matchData.players ?? TotalWicket,
          scoringTeam: liveData.scoringTeam,
          chessingTeam: liveData.chessingTeam,
          totalRuns: liveData.totalRuns,
          wicketCount: liveData.wicketCount,
          overCount: liveData.overCount,
          hasMatchEnded: !!liveData.hasMatchEnded,
          remainingRuns: liveData.remainingRuns,
          remainingBalls: liveData.remainingBalls,
        })
      : liveData?.winningMessage;

  const remainingRunsContent3 = (
    <>
      <div>{winningMessage}</div>
      {hasMatchEnded ? (
        <div>
          Please click &quot;{endInningButtonDisplayLabel}&quot; button to Save Result
        </div>
      ) : (
        <div>Please click "SCORECARD" button</div>
      )}
    </>
  );

  const remainingRunsContent1 = (
    <>
      <div>Target: {liveData?.target}</div>
      <div>{liveViewerWinningLine}</div>
      <div>
        RRR: {isNaN(liveData?.rrr) ? 0 : liveData?.rrr >= 0 ? liveData?.rrr : 0}
      </div>
    </>
  );

  const remainingRunsContent2 = (
    <>
      {/* <div>Target: {liveData?.target}</div> */}
      <div style={{ display: "inline", color: "yellow" }}>|</div>
      <div>{liveViewerWinningLine}</div>
      <div style={{ display: "inline", color: "yellow" }}>|</div>
      {/* <div>RRR: {isNaN(liveData?.rrr) ? 0 : liveData?.rrr >=0 ? liveData?.rrr  : 0}</div> */}
    </>
  );

  // User
  // Try to implement winning msg for user // create extra field in live schema with current message
  const winnerCard5 = (
    <>
      <p> {liveViewerWinningLine}</p>
    </>
  );

  const winnerCard4 = (
    <>
      <p> Match Ended</p>
    </>
  );

  // Admin
  const winnerCard3 = (
    <>
      <p> {winningMessage}</p>
    </>
  );

  const winnerCard2 = (
    <>
      <p>Break Time</p>
    </>
  );

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
    if (["Final", "Qualifier 1", "Qualifier 2", "Eliminator"].includes(match.matchType)) return;

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

  const { newMatch } = props;

  //   useEffect(() => {
  //   if (newMatch) {
  //     updateLiveMatch();
  //     handleLIVEscore();
  //   }
  // }, [
  //   newMatch,
  //   updateLiveMatch,
  //   handleLIVEscore,
  //   inningNo,
  //   totalRuns,
  //   wicketCount,
  //   totalOvers,
  //   overCount,
  //   ballCount,
  //   hasMatchEnded,
  //   remainingRuns,
  //   remainingBalls,
  //   batter1,
  //   batter2,
  //   bowler,
  //   bowlers,
  //   extras,
  //   recentOvers,
  //   match,
  // ]);

  /** Keep scorecard `match` innings + push live API whenever scoring state changes (admin). */
  useEffect(() => {
    if (!newMatch) return;
    updateLiveMatch();
    handleLIVEscore();
    // Do not depend on updateLiveMatch/handleLIVEscore: they change when `match` updates,
    // and handleLIVEscore calls setMatch → would retrigger this effect forever.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    newMatch,
    inningNo,
    totalRuns,
    wicketCount,
    totalOvers,
    overCount,
    ballCount,
    hasMatchEnded,
    remainingRuns,
    remainingBalls,
    batters,
    batter1,
    batter2,
    bowler,
    bowlers,
    extras,
    recentOvers,
  ]);

  return (
    // main container
    <div className="container">
      {/* Title Heading */}
      {!props.newMatch && (
        // Show match title and buttons if newmatch is true
        <AppBar position="fixed">
          <Toolbar
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">WELCOME</Typography>
          </Toolbar>
        </AppBar>
      )}

      {props.newMatch && (
        <div className="inning">
          <div className="tag">
            <div className="TitleTag">
              <div>
                {team1} vs {team2}
              </div>
            </div>
            <div>
              {/* User */}
              {!props.Admin && props.newMatch && (
                <div className="Active">LIVE</div>
              )}
              {props.newMatch && props.Admin && (
                <button id="end-inning" onClick={handleEndInning}>
                  {endInningButtonDisplayLabel}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Notice */}
      <div
        id="badge"
        className="badge badge-flex"
        style={{ marginTop: props.newMatch ? "0" : "64px" }}
      >
        {props.Admin
          ? props.newMatch
            ? inningNo === 2
              ? remainingBalls === 0 || hasMatchEnded
                ? remainingRunsContent3
                : remainingRunsContent
              : overCount === maxOver || wicketCount === TotalWicket
                ? firstInningCompletedContent
                : welcomeContent
            : welcomeContent
          : liveData && matchData && props.newMatch
            ? liveData.inningNo === 2
              ? liveData.remainingBalls === 0 ||
                liveData.remainingRuns <= 0 ||
                liveData.overCount === matchData.maxOver ||
                liveData.wicketCount === TotalWicket ||
                liveData.hasMatchEnded
                ? remainingRunsContent2
                : remainingRunsContent1
              : liveData.overCount === matchData.maxOver ||
                  liveData.wicketCount === TotalWicket
                ? firstInningCompletedContent1
                : welcomeContent
            : welcomeContent}
      </div>

      {/* edit*/}
      <div className="score-container">
        {/* Wicket Types */}
        <div>
          <Modal
            open={isModalOpen}
            onClose={handleWicketModalDismiss}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={radioGroupBoxstyle}>
              <FormControl
                component="fieldset"
                sx={{
                  display: "flex",
                  flexDirection: "column", // Ensure radio buttons are stacked vertically
                  alignItems: "center",
                  justifyContent: "center",
                  margin: 2,
                }}
              >
                <RadioGroup
                  row
                  aria-label="wicket"
                  name="row-radio-buttons-group"
                  value={outType}
                  onChange={handleOutTypeChange}
                  sx={{
                    display: "flex",
                    flexDirection: "column", // Ensure radio buttons are stacked vertically
                    alignItems: "flex-start",
                    justifyContent: "center",
                    marginBottom: 2,
                  }}
                >
                  <FormControlLabel
                    value={CATCH}
                    disabled={runOutOnlyOverthrow}
                    control={
                      <Radio
                        sx={{
                          "&.Mui-checked": {
                            color: pink[600],
                          },
                        }}
                      />
                    }
                    label={CATCH}
                  />
                  <FormControlLabel
                    value={STUMP}
                    disabled={runOutOnlyOverthrow}
                    control={
                      <Radio
                        sx={{
                          "&.Mui-checked": {
                            color: pink[600],
                          },
                        }}
                      />
                    }
                    label={STUMP}
                  />
                  <FormControlLabel
                    value={HIT_WICKET}
                    disabled={runOutOnlyOverthrow}
                    control={
                      <Radio
                        sx={{
                          "&.Mui-checked": {
                            color: pink[600],
                          },
                        }}
                      />
                    }
                    label={HIT_WICKET}
                  />
                  <FormControlLabel
                    value={BOLD}
                    disabled={runOutOnlyOverthrow}
                    control={
                      <Radio
                        sx={{
                          "&.Mui-checked": {
                            color: pink[600],
                          },
                        }}
                      />
                    }
                    label={BOLD}
                  />
                  <FormControlLabel
                    value={RUN_OUT}
                    control={
                      <Radio
                        sx={{
                          "&.Mui-checked": {
                            color: pink[600],
                          },
                        }}
                      />
                    }
                    label={RUN_OUT}
                  />
                  <FormControlLabel
                    value={OUT_OF_GROUND}
                    disabled={runOutOnlyOverthrow}
                    control={
                      <Radio
                        sx={{
                          "&.Mui-checked": {
                            color: pink[600],
                          },
                        }}
                      />
                    }
                    label={OUT_OF_GROUND}
                  />
                  <select
                    value={runOutPlayerId}
                    id="run-out-player"
                    className={
                      runOutPlayerUiVisible
                        ? "run-out-player"
                        : "run-out-player hide"
                    }
                    onChange={handleRunOutPlayerChange}
                  >
                    <option value="" disabled>
                      select option
                    </option>
                    <option value={batter1.id}>{batter1.name}</option>
                    <option value={batter2.id}>{batter2.name}</option>
                  </select>
                </RadioGroup>
                <div
                  id="run-out-player-error"
                  className={
                    runOutPlayerErrorVisible
                      ? "run-out-player-error"
                      : "run-out-player-error hide"
                  }
                >
                  Please select run out player name
                </div>
                {runOutPlayerUiVisible && (
                  <Box sx={{ mt: 1.5, width: "100%" }}>
                    <Typography
                      variant="caption"
                      display="block"
                      style={{ marginBottom: 8 }}
                    >
                      Runs completed before run out (credited to striker)
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      {[1,2,3,4,5,6,7,8].map((n) => (
                        <Button
                          key={n}
                          type="button"
                          size="small"
                          variant={
                            runOutCompletedRuns === n ? "contained" : "outlined"
                          }
                          color="inherit"
                          onClick={() => setRunOutCompletedRuns(n)}
                        >
                          {n}
                        </Button>
                      ))}
                      <Button
                        type="button"
                        size="small"
                        variant={
                          runOutCompletedRuns === 0 ? "contained" : "outlined"
                        }
                        color="inherit"
                        onClick={() => setRunOutCompletedRuns(0)}
                      >
                        0
                      </Button>
                    </Box>
                  </Box>
                )}
                <Box
                  sx={{
                    display: "flex",
                    gap: 1.5,
                    justifyContent: "center",
                    flexWrap: "wrap",
                    mt: 2,
                    width: "100%",
                  }}
                >
                  <Button
                    type="button"
                    variant="outlined"
                    color="inherit"
                    onClick={handleWicketModalClear}
                  >
                    Clear
                  </Button>
                  <Button
                    type="button"
                    variant="contained"
                    disabled={!wicketModalOkEnabled}
                    onClick={handleWicketModalDone}
                  >
                    OK
                  </Button>
                </Box>
              </FormControl>
            </Box>
          </Modal>
        </div>
        {/* Navigation */}
        <div className="tabs">
          <button
            className={`tab ${
              activeSection === "matchInfo" ? "active-tab" : ""
            }`}
            onClick={() => setActiveSection("matchInfo")}
          >
            Match
          </button>
          <button
            className={`tab ${
              activeSection === "liveScore" ? "active-tab" : ""
            }`}
            onClick={() => setActiveSection("liveScore")}
          >
            Live
          </button>
          <button
            className={`tab ${
              activeSection === "scoreCard" ? "active-tab" : ""
            }`}
            onClick={() => setActiveSection("scoreCard")}
          >
            Score
          </button>
          <button
            className={`tab ${activeSection === "result" ? "active-tab" : ""}`}
            onClick={() => setActiveSection("result")}
          >
            Result
          </button>
          <button
            className={`tab ${activeSection === "pointtable" ? "active-tab" : ""}`}
            onClick={() => setActiveSection("pointtable")}
          >
            Point
          </button>
          <button
            className={`tab ${activeSection === "Leaderboard" ? "active-tab" : ""}`}
            onClick={() => setActiveSection("Leaderboard")}
          >
            Star
          </button>
          {props.Admin && (
            <button
              className={`tab ${
                activeSection === "setting" ? "active-tab" : ""
              }`}
              onClick={() => setActiveSection("setting")}
            >
              Setting
            </button>
          )}
        </div>
        {/* All section */}
        <div>
           {activeSection === "matchInfo" &&
            !props.newMatch && (
              <div className="Imgdiv">
                <img
                  className="NoMatchLive"
                  src="/images/A1.png"
                  alt="No match available"
                />
              </div>
            )}

           {activeSection === "liveScore"  &&
            !props.newMatch && (
              <div className="Imgdiv">
                <img
                  className="NoMatchLive"
                  src="/images/A2.png"
                  alt="No match available"
                />
              </div>
            )}

            {activeSection === "scoreCard" &&
            !props.newMatch && (
              <div className="Imgdiv">
                <img
                  className="NoMatchLive"
                  src="/images/A3.png"
                  alt="No match available"
                />
              </div>
            )}

           {(activeSection === "result" &&
            scores?.length <= 0) && (
              <div className="Imgdiv">
                <img
                  className="NoMatchLive"
                  src="/images/A4.png"
                  alt="No match available"
                />
              </div>)}

            {(activeSection === "pointtable" && pointsTable?.length <= 0 && (
              <div className="Imgdiv">
                <img
                  className="NoMatchLive"
                  src="/images/A5.png"
                  alt="No match available"
                />
              </div>))}

          {/*Section 1 :  Match Info */}
          {activeSection === "matchInfo" &&
            matchData &&
            liveData &&
            props.newMatch && (
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
                          <td className="value">
                            {matchData.team1} vs {matchData.team2}
                          </td>
                        </tr>
                        <tr>
                          <td className="label">Inning</td>
                          {/* <td className="value">{inningNo === 1 ? "1st" : "2nd"}</td> */}
                          <td className="value">
                            {liveData.inningNo === 1 ? "1st" : "2nd"}
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
                          <td className="value">{currentDate}</td>
                        </tr>
                        <tr>
                          <td className="label">Time</td>
                          <td className="value">{currentTime}</td>
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

          {/*Section 2 :  Live Score */}
          {activeSection === "liveScore" &&
            matchData &&
            liveData &&
            props.newMatch && (
              <div id="liveScore">
                {/* User panel */}
                <div className="score-container1">
                  <div className="Tag">
                    <div className="First">
                      <div className="Data" style={{ marginBottom: "5px" }}>
                        <div className="Circle"></div>
                        <div className="upcoming">
                          {matchData?.matchType &&
                          matchData.matchType !== "Normal"
                            ? matchData.matchType
                            : "Live"}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="team-score1">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {scoringTeam}
                      {liveData.inningNo === 1 && (
                        <SportsCricketIcon
                          style={{
                            marginLeft: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        /> // Bat symbol for scoring team
                      )}
                    </div>
                    {props.Admin ? (
                      <span className="score1">
                        {inningNo === 1 ? totalRuns : inning1.runs}-
                        {inningNo === 1 ? wicketCount : inning1.wickets} (
                        {inningNo === 1 ? totalOvers : inning1.overs})
                      </span>
                    ) : (
                      <span className="score1">
                        `
                        {liveData.inningNo === 1
                          ? liveData.totalRuns
                          : liveData.inning1.runs}
                        -
                        {liveData.inningNo === 1
                          ? liveData.wicketCount
                          : liveData.inning1.wickets}{" "}
                        (
                        {liveData.inningNo === 1
                          ? liveData.totalOvers
                          : liveData.inning1.overs}
                        )
                      </span>
                    )}
                  </div>

                  <div className="team-score1">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {chessingTeam}
                      {liveData.inningNo !== 1 && (
                        <SportsCricketIcon style={{ marginLeft: "8px" }} /> // Bat symbol for chasing team
                      )}
                    </div>
                    {props.Admin ? (
                      <span className="score1">
                        {inningNo === 1
                          ? `0-0 (0)`
                          : `${hasMatchEnded ? inning2.runs : totalRuns}-${
                              hasMatchEnded ? inning2.wickets : wicketCount
                            } (${hasMatchEnded ? inning2.overs : totalOvers})`}
                      </span>
                    ) : (
                      <span className="score1">
                        {liveData.inningNo === 1
                          ? `0-0 (0)`
                          : `${liveData.hasMatchEnded ? liveData.inning2.runs : liveData.totalRuns}-${
                              liveData.hasMatchEnded
                                ? liveData.inning2.wickets
                                : liveData.wicketCount
                            } (${liveData.hasMatchEnded ? liveData.inning2.overs : liveData.totalOvers})`}
                      </span>
                    )}
                  </div>

                  <div className="line"></div>

                  <div className="result">
                    {props.Admin
                      ? inningNo === 2
                        ? winnerCard3
                        : overCount === maxOver || wicketCount === TotalWicket
                          ? winnerCard2
                          : tossContent
                      : liveData.inningNo === 2
                        ? liveData.remainingBalls === 0 ||
                          liveData.remainingRuns <= 0 ||
                          liveData.overCount === matchData.maxOver ||
                          liveData.wicketCount === TotalWicket
                          ? winnerCard4
                          : winnerCard5
                        : liveData.overCount === matchData.maxOver ||
                            liveData.wicketCount === TotalWicket
                          ? winnerCard2
                          : tossContent}
                  </div>
                </div>
                {/* Admin panel */}
                {props.Admin && !hasMatchEnded && (
                  <div>
                    {/*Score Line*/}
                    <div className="score">
                      <div>
                        {inningNo === 1 ? scoringTeam : chessingTeam} :{" "}
                        {totalRuns}/{wicketCount} ({totalOvers}/{maxOver})
                      </div>
                      <div>CRR : {isNaN(crr) ? 0 : crr}</div>
                    </div>
                    {/* Batter */}
                    <div className="batting-container">
                      <table>
                        <thead>
                          <tr>
                            <td className="score-types">
                              <div className="batter">Batter</div>
                            </td>
                            <td className="score-types text-center">R</td>
                            <td className="score-types text-center">B</td>
                            <td className="score-types text-center">4s</td>
                            <td className="score-types text-center">6s</td>
                            <td className="score-types text-center">SR</td>
                          </tr>
                        </thead>
                        <tbody>
                          {/* Batter 1 */}
                          <tr>
                            <td className="score-types">
                              <span id="strike">
                                <Radio
                                  size="small"
                                  checked={strikeValue === "strike"}
                                  value="strike"
                                  onChange={handleStrikeChange}
                                  name="radio-buttons"
                                  inputProps={{ "aria-label": "strike" }}
                                  style={{ padding: "0 4px 0 2px" }}
                                />
                              </span>
                              <div className="player-input-row">
                                <input
                                  type="text"
                                  value={batter1.name ?? ""}
                                  id="batter1Name"
                                  className="batter-name"
                                  onChange={(e) => {
                                    setBatter1SaveConfirmed(false);
                                    setBatter1((prev) => ({
                                      ...prev,
                                      name: e.target.value,
                                    }));
                                  }}
                                  disabled={batter1InputDisabled}
                                />
                                <button
                                  type="button"
                                  className={batter1SaveBtnClass}
                                  onClick={commitBatter1}
                                  disabled={batter1InputDisabled}
                                >
                                  Save
                                </button>
                                <IconButton
                                  color="primary"
                                  className="icon-button"
                                  onClick={editBatter1Name}
                                >
                                  <EditIcon className="icon-size" />
                                </IconButton>
                              </div>
                            </td>
                            <td className="score-types text-center">
                              {batter1.run === undefined ? 0 : batter1.run}
                            </td>
                            <td className="score-types text-center">
                              {batter1.ball === undefined ? 0 : batter1.ball}
                            </td>
                            <td className="score-types text-center">
                              {batter1.four === undefined ? 0 : batter1.four}
                            </td>
                            <td className="score-types text-center">
                              {batter1.six === undefined ? 0 : batter1.six}
                            </td>
                            <td className="score-types text-center">
                              {batter1.strikeRate === undefined
                                ? 0
                                : batter1.strikeRate}
                            </td>
                          </tr>
                          {/* Batter 2 */}
                          <tr>
                            <td className="score-types">
                              <span id="non-strike">
                                <Radio
                                  size="small"
                                  checked={strikeValue === "non-strike"}
                                  value="non-strike"
                                  onChange={handleStrikeChange}
                                  name="radio-buttons"
                                  inputProps={{ "aria-label": "non-strike" }}
                                  style={{ padding: "0 4px 0 2px" }}
                                />
                              </span>
                              <div className="player-input-row">
                                <input
                                  type="text"
                                  value={batter2.name ?? ""}
                                  id="batter2Name"
                                  className="batter-name"
                                  onChange={(e) => {
                                    setBatter2SaveConfirmed(false);
                                    setBatter2((prev) => ({
                                      ...prev,
                                      name: e.target.value,
                                    }));
                                  }}
                                  disabled={batter2InputDisabled}
                                />
                                <button
                                  type="button"
                                  className={batter2SaveBtnClass}
                                  onClick={commitBatter2}
                                  disabled={batter2InputDisabled}
                                >
                                  Save
                                </button>
                                <IconButton
                                  color="primary"
                                  className="icon-button"
                                  onClick={editBatter2Name}
                                >
                                  <EditIcon className="icon-size" />
                                </IconButton>
                              </div>
                            </td>
                            <td className="score-types text-center">
                              {batter2.run === undefined ? 0 : batter2.run}
                            </td>
                            <td className="score-types text-center">
                              {batter2.ball === undefined ? 0 : batter2.ball}
                            </td>
                            <td className="score-types text-center">
                              {batter2.four === undefined ? 0 : batter2.four}
                            </td>
                            <td className="score-types text-center">
                              {batter2.six === undefined ? 0 : batter2.six}
                            </td>
                            <td className="score-types text-center">
                              {batter2.strikeRate === undefined
                                ? 0
                                : batter2.strikeRate}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    {/* Bowler */}
                    <div className="bowler-container">
                      <div className="bowler">
                        <div className="One">
                          Bowler
                          <div className="bowler-input-row">
                            <Autosuggest
                              suggestions={suggestions}
                              onSuggestionsFetchRequested={
                                onSuggestionsFetchRequested
                              }
                              onSuggestionsClearRequested={() => {
                                setSuggestions([]);
                              }}
                              getSuggestionValue={getSuggestionValue}
                              renderSuggestion={(suggestion) => (
                                <div>{suggestion.name}</div>
                              )}
                              inputProps={inputProps}
                            />
                            <button
                              type="button"
                              className={bowlerSaveBtnClass}
                              onClick={commitBowler}
                              disabled={bowlerInputDisabled}
                            >
                              Save
                            </button>
                            <IconButton
                              color="primary"
                              className="icon-button"
                              onClick={editBowlerName}
                            >
                              <EditIcon className="icon-size" />
                            </IconButton>
                          </div>
                        </div>
                        <div className="Options">
                          {/* <div className="Two1">
                          <div>EDIT</div>
                          <IconButton
                            color="blue"
                            className="icon-button"
                            onClick={enableScoreButtons(".score-types-button")}
                          >
                             <EditIcon className="icon-size1" />
                          </IconButton>
                        </div> */}
                          <div className="Two">
                            <div>UNDO</div>
                            <IconButton
                              color="warning"
                              className="icon-button"
                              onClick={undoDelivery}
                            >
                              <DeleteIcon className="delete-icon-size" />
                            </IconButton>
                          </div>
                        </div>
                      </div>
                      <div className="bowler-runs">
                        {currentRunStack.map((run, i) => (
                          <div key={i}>{formatRunToken(run)}</div>
                        ))}
                      </div>
                    </div>
                    {/* Keypad */}
                    <div
                      className={`score-types-container${
                        !keypadBaseReady ? " score-keypad--needs-save" : ""
                      }`}
                    >
                      <table>
                        <tbody>
                          <tr>
                            <td className="score-types">
                              <button
                                type="button"
                                className={`INACTIVE INACTIVE1 score-types-button${numberNoballClass}${ovNumberBtnClass}`}
                                disabled={numScoreButtonsDisabled}
                                onClick={() => handleRun(0)}
                              >
                                0
                              </button>
                            </td>
                            <td className="score-types">
                              <button
                                type="button"
                                className={`INACTIVE INACTIVE1 score-types-button${numberNoballClass}${ovNumberBtnClass}`}
                                disabled={numScoreButtonsDisabled}
                                onClick={() => handleRun(1)}
                              >
                                1
                              </button>
                            </td>
                            <td className="score-types">
                              <button
                                type="button"
                                className={`INACTIVE INACTIVE1 score-types-button${numberNoballClass}${ovNumberBtnClass}`}
                                disabled={numScoreButtonsDisabled}
                                onClick={() => handleRun(2)}
                              >
                                2
                              </button>
                            </td>
                            <td className="score-types">
                              <button
                                type="button"
                                className="ACTIVE ACTIVE1 score-types-button"
                                disabled={nbWdLbDisabled}
                                onClick={() => handleNoBall()}
                              >
                                NB
                              </button>
                            </td>
                            <td className="score-types">
                              <button
                                type="button"
                                className="ACTIVE ACTIVE1 score-types-button"
                                disabled={ovDisabled}
                                onClick={handleOverthrowMode}
                              >
                                OT
                              </button>
                            </td>
                            <td className="score-types">
                              <button
                                type="button"
                                className={`INACTIVE ACTIVE1 score-types-button${wNoballClass}${wOverthrowClass}`}
                                disabled={wDisabled}
                                onClick={() => {
                                  if (
                                    !keypadBaseReady ||
                                    keypadAllDisabled ||
                                    (keypadActive1Disabled &&
                                      !iswideball &&
                                      !isLb &&
                                      !isBye) ||
                                    overthrowMode === "before"
                                  ) {
                                    return;
                                  }
                                  if (
                                    overthrowMode === "after" ||
                                    isNoBall ||
                                    iswideball ||
                                    isLb ||
                                    isBye
                                  ) {
                                    setOutType(RUN_OUT);
                                    setRunOutPlayerUiVisible(true);
                                    setRunOutPlayerErrorVisible(true);
                                  } else {
                                    setOutType("");
                                    setRunOutPlayerUiVisible(false);
                                    setRunOutPlayerErrorVisible(false);
                                  }
                                  setRunOutPlayerId("");
                                  setRunOutCompletedRuns(0);
                                  setModalOpen(true);
                                  handleCurrentBall(0);
                                }}
                              >
                                W
                              </button>
                            </td>
                          </tr>
                          <tr>
                            <td className="score-types">
                              <button
                                type="button"
                                className={`INACTIVE INACTIVE1 score-types-button${numberNoballClass}${ovNumberBtnClass}`}
                                disabled={numScoreButtonsDisabled}
                                onClick={() => handleRun(3)}
                              >
                                3
                              </button>
                            </td>
                            <td className="score-types">
                              <button
                                type="button"
                                className={`INACTIVE INACTIVE1 score-types-button${numberNoballClass}${ovNumberBtnClass}`}
                                disabled={numScoreButtonsDisabled}
                                onClick={() => handleRun(4)}
                              >
                                4
                              </button>
                            </td>
                            <td className="score-types">
                              <button
                                type="button"
                                className={`INACTIVE INACTIVE1 score-types-button${numberNoballClass}${ovNumberBtnClass}`}
                                disabled={numScoreButtonsDisabled}
                                onClick={() => handleRun(6)}
                              >
                                6
                              </button>
                            </td>
                            <td className="score-types">
                              <button
                                type="button"
                                className="ACTIVE ACTIVE1 score-types-button"
                                disabled={nbWdLbDisabled}
                                onClick={() => handleWide()}
                              >
                                WD
                              </button>
                            </td>
                            <td className="score-types">
                              <button
                                type="button"
                                className="ACTIVE ACTIVE1 score-types-button"
                                disabled={nbWdLbDisabled}
                                onClick={() => handleLb()}
                              >
                                LB
                              </button>
                            </td>
                            <td className="score-types">
                              <button
                                type="button"
                                className="ACTIVE ACTIVE1 score-types-button"
                                disabled={nbWdLbDisabled}
                                onClick={() => handleBye()}
                              >
                                B
                              </button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    {ovModeActive && (
                      <div className="overthrow-instruction">
                        {overthrowMode === "before"
                          ? "add runs before overthrow"
                          : "add runs after overthrow"}
                      </div>
                    )}
                    {/* Extra Run */}
                    <div className="extras-container">
                      <div>Extras</div>
                      <div className="extra">
                        <div>Total: {extras.total}</div>
                        <div>Wd: {extras.wide}</div>
                        <div>Nb: {extras.noBall}</div>
                        <div>Lb: {extras.Lb}</div>
                        <div>B: {extras.Bye || 0}</div>
                      </div>
                    </div>
                    {/* Recent Over */}
                    <div className="recent-over-container">
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
                            {recentOvers.map((recentOver, i) => (
                              <tr key={i}>
                                <td className="text-center">
                                  {recentOver.overNo}
                                </td>
                                <td className="text-center">
                                  {recentOver.bowler}
                                </td>
                                <td>
                                  <div className="recent-over-runs">
                                    {recentOver.stack.map((run, index) => (
                                      <div key={index}>{formatRunToken(run)}</div>
                                    ))}
                                  </div>
                                </td>
                                <td className="recent-over-total-run">
                                  <div>{recentOver.runs}</div>
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
            )}

          {/*Section 3 :  Score Card*/}
          {activeSection === "scoreCard" && liveData && props.newMatch && (
            <div id="scoreCard">
              {/* Scorecard */}
              <div className="score-board-container">
                <div className="score-board-text text-center">Score Board</div>
                {/* Inning1 Starts here */}
                <div>
                  <div
                    className="score-board-innings"
                    onClick={(e) => {
                      handleLIVEscore();
                      toggleSlide1();
                    }}
                  >
                    <div>{scoringTeam} ( 1st Innings )</div>
                    {/* <div>
                      {inningNo === 1 ? totalRuns : inning1.runs}-
                      {inningNo === 1 ? wicketCount : inning1.wickets} (
                      {inningNo === 1 ? totalOvers : inning1.overs} Ov)
                    </div> */}
                    {props.Admin ? (
                      <div>
                        {inningNo === 1 ? totalRuns : inning1.runs}-
                        {inningNo === 1 ? wicketCount : inning1.wickets} (
                        {inningNo === 1 ? totalOvers : inning1.overs} Ov)
                      </div>
                    ) : (
                      <div>
                        {liveData.inningNo === 1
                          ? liveData.totalRuns
                          : liveData.inning1.runs}
                        -
                        {liveData.inningNo === 1
                          ? liveData.wicketCount
                          : liveData.inning1.wickets}{" "}
                        (
                        {liveData.inningNo === 1
                          ? liveData.totalOvers
                          : liveData.inning1.overs}{" "}
                        Ov)
                      </div>
                    )}
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

                              /* ================= USER ================= */
                              if (!props.Admin) {
                                battersList = liveData?.inning1?.batters || [];
                                batterOne = liveData?.batter1;
                                batterTwo = liveData?.batter2;
                              } else {

                              /* ================= ADMIN ================= */
                                // Admin + Inning 1 → LOCAL
                                if (inningNo === 1) {
                                  const map = new Map();

                                  (batters || []).forEach(
                                    (b) => b?.name && map.set(b.name, b),
                                  );
                                  if (batter1?.name)
                                    map.set(batter1.name, batter1);
                                  if (batter2?.name)
                                    map.set(batter2.name, batter2);

                                  battersList = Array.from(map.values());
                                  batterOne = batter1;
                                  batterTwo = batter2;
                                }
                                // Admin + Inning 2 → SHOW NOTHING
                                else {
                                  battersList =
                                    liveData?.inning1?.batters || [];
                                  batterOne = liveData?.batter1;
                                  batterTwo = liveData?.batter2;
                                }
                              }

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
                                const isCurrentBowler =
                                  inningNo === 1 &&
                                  (props.Admin
                                    ? match?.bowler?.name === blr?.name
                                    : liveData?.bowler?.name === blr?.name);

                                return (
                                  <tr
                                    key={`inning1-${blr.name}-${index}`}
                                    style={{
                                      fontWeight: isCurrentBowler
                                        ? "700"
                                        : "400",
                                      color: isCurrentBowler
                                        ? "green"
                                        : "inherit",
                                    }}
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
                              <div>B: {extras.Bye || 0}</div>
                            </div>
                          </div>
                        );
                      })()}
                      {/* Run Rate – Inning 1 */}
                      <div className="extras-container">
                        <div>Run Rate</div>
                        <div className="extra">
                          <div>
                            {props.Admin
                              ? inningNo === 1
                                ? runrate
                                : liveData.inning1.runRate
                              : liveData.inningNo === 1
                                ? liveData.crr
                                : liveData.inning1.runRate}
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
                          {props.Admin ? (
                            <div>
                              {inningNo === 1 ? totalRuns : inning1.runs}-
                              {inningNo === 1 ? wicketCount : inning1.wickets} (
                              {inningNo === 1 ? totalOvers : inning1.overs} Ov)
                            </div>
                          ) : (
                            <div>
                              {liveData.inningNo === 1
                                ? liveData.totalRuns
                                : liveData.inning1.runs}
                              -
                              {liveData.inningNo === 1
                                ? liveData.wicketCount
                                : liveData.inning1.wickets}{" "}
                              (
                              {liveData.inningNo === 1
                                ? liveData.totalOvers
                                : liveData.inning1.overs}{" "}
                              Ov)
                            </div>
                          )}
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
                              {(props.isAdmin
                                ? inningNo === 1
                                  ? recentOvers // admin + inning 1 running
                                  : recentOvers1 // admin + inning 2 running
                                : liveData?.inning1?.recentOvers || []
                              ).map((over, i) => (
                                <tr key={i}>
                                  <td className="text-center">{over.overNo}</td>
                                  <td className="text-center">{over.bowler}</td>
                                  <td>
                                    <div className="recent-over-runs">
                                      {over.stack.map((run, index) => (
                                        <div key={index}>{formatRunToken(run)}</div>
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
                    <div>{chessingTeam} ( 2nd Innings )</div>
                    <div>
                      {/* {inningNo === 1
                        ? "0-0 (0 Ov)"
                        : `${hasMatchEnded ? inning2.runs : totalRuns}-${
                            hasMatchEnded ? inning2.wickets : wicketCount
                          } (${hasMatchEnded ? inning2.overs : totalOvers} Ov)`}
                        */}
                      {props.Admin ? (
                        <div>
                          {inningNo === 1
                            ? `0-0 (0 Ov)`
                            : `${hasMatchEnded ? inning2.runs : totalRuns}-${
                                hasMatchEnded ? inning2.wickets : wicketCount
                              } (${hasMatchEnded ? inning2.overs : totalOvers} Ov)`}
                        </div>
                      ) : (
                        <div>
                          {liveData.inningNo === 1
                            ? `0-0 (0 Ov)`
                            : `${liveData.hasMatchEnded ? liveData.inning2.runs : liveData.totalRuns}-${
                                liveData.hasMatchEnded
                                  ? liveData.inning2.wickets
                                  : liveData.wicketCount
                              } (${liveData.hasMatchEnded ? liveData.inning2.overs : liveData.totalOvers} Ov)`}
                        </div>
                      )}
                      {/* {hasMatchEnded ? inning2.runs : totalRuns}-{hasMatchEnded ? inning2.wickets : wicketCount} (
                  {hasMatchEnded ? inning2.overs : totalOvers} Ov) */}
                    </div>
                  </div>
                  {/*  liveData.hasMatchEnded && */}
                  {isSlideOpen2 && (
                    <div className="sliding-panel">
                      {/* ================= INNING 2 BATTING ================= */}
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

                              /* ================= USER ================= */
                              if (!props.Admin) {
                                battersList =
                                  liveData?.inningNo === 2
                                    ? liveData?.inning2?.batters || []
                                    : [];
                                batterOne = liveData?.batter1;
                                batterTwo = liveData?.batter2;
                              } else {

                              /* ================= ADMIN ================= */
                                // Admin + Inning 2 → LOCAL
                                if (inningNo === 2 && !hasMatchEnded) {
                                  const map = new Map();

                                  (batters || []).forEach((b) => {
                                    if (b?.name && !map.has(b.name)) {
                                      map.set(b.name, b);
                                    }
                                  });

                                  if (batter1?.name && !map.has(batter1.id)) {
                                    map.set(batter1.name, batter1);
                                  }

                                  if (batter2?.name && !map.has(batter2.id)) {
                                    map.set(batter2.name, batter2);
                                  }

                                  battersList = Array.from(map.values());
                                  batterOne = batter1;
                                  batterTwo = batter2;
                                } else if (hasMatchEnded) {
                                  battersList = match?.inning2?.batters || [];
                                  batterOne = null;
                                  batterTwo = null;
                                } else {
                                  battersList = [];
                                  batterOne = null;
                                  batterTwo = null;
                                }
                              }

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

                      {/* ================= BOWLING 2 ================= */}
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
                                const isCurrentBowler =
                                  inningNo === 2 &&
                                  (props.Admin
                                    ? match?.bowler?.name === blr?.name
                                    : liveData?.bowler?.name === blr?.name);

                                return (
                                  <tr
                                    key={`inning2-${blr.name}-${index}`}
                                    style={{
                                      fontWeight: isCurrentBowler
                                        ? "700"
                                        : "400",
                                      color: isCurrentBowler
                                        ? "green"
                                        : "inherit",
                                    }}
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
                              <div>B: {extras.Bye || 0}</div>
                            </div>
                          </div>
                        );
                      })()}
                      {/* Run Rate – Inning 2 */}
                      <div className="extras-container">
                        <div>Run Rate</div>
                        <div className="extra">
                          <div>
                            {props.Admin
                              ? inningNo === 2
                                ? runrate
                                : "0.00"
                              : liveData.inningNo === 2
                                ? liveData.crr
                                : "0.00"}
                          </div>
                        </div>
                      </div>
                      {/* Total */}
                      <div className="extras-container">
                        <div>Total</div>
                        <div className="extra">
                          <div>
                            {/* {inningNo === 1
                              ? "0-0 (0 Ov)"
                              : `${hasMatchEnded ? inning2.runs : totalRuns}-${
                                  hasMatchEnded ? inning2.wickets : wicketCount
                                } (${
                                  hasMatchEnded ? inning2.overs : totalOvers
                                } Ov)`} */}
                            {props.Admin ? (
                              <div>
                                {inningNo === 1
                                  ? `0-0 (0 Ov)`
                                  : `${hasMatchEnded ? inning2.runs : totalRuns}-${
                                      hasMatchEnded
                                        ? inning2.wickets
                                        : wicketCount
                                    } (${hasMatchEnded ? inning2.overs : totalOvers})`}
                              </div>
                            ) : (
                              <div>
                                {liveData.inningNo === 1
                                  ? `0-0 (0 Ov)`
                                  : `${liveData.hasMatchEnded ? liveData.inning2.runs : liveData.totalRuns}-${
                                      liveData.hasMatchEnded
                                        ? liveData.inning2.wickets
                                        : liveData.wicketCount
                                    } (${liveData.hasMatchEnded ? liveData.inning2.overs : liveData.totalOvers})`}
                              </div>
                            )}
                            {/* {hasMatchEnded ? inning2.runs : totalRuns}-{hasMatchEnded ? inning2.wickets : wicketCount} (
                  {hasMatchEnded ? inning2.overs : totalOvers} Ov) */}
                          </div>
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
                              {match.inning2.recentOvers.map(
                                (recentOver, i) => (
                                  <tr key={i}>
                                    <td className="text-center">
                                      {recentOver.overNo}
                                    </td>
                                    <td className="text-center">
                                      {recentOver.bowler}
                                    </td>
                                    <td>
                                      <div className="recent-over-runs">
                                        {recentOver.stack.map((run, index) => (
                                          <div key={index}>
                                            {formatRunToken(run)}
                                          </div>
                                        ))}
                                      </div>
                                    </td>
                                    <td className="recent-over-total-run">
                                      <div>{recentOver.runs}</div>
                                    </td>
                                  </tr>
                                ),
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div> */}
                      {/* ================= INNING 2 : RECENT OVERS ================= */}
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
                              {(props.isAdmin
                                ? hasMatchEnded
                                  ? match?.inning2?.recentOvers || []
                                  : inningNo === 2
                                    ? recentOvers
                                    : []
                                : liveData?.inningNo === 2
                                  ? liveData?.inning2?.recentOvers || []
                                  : []
                              ).map((over, i) => (
                                <tr key={i}>
                                  <td className="text-center">{over.overNo}</td>
                                  <td className="text-center">{over.bowler}</td>
                                  <td>
                                    <div className="recent-over-runs">
                                      {over.stack.map((run, index) => (
                                        <div key={index}>{formatRunToken(run)}</div>
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

          {/*Section 4 :  Result */}
          {activeSection === "result" &&
            scores.length > 0 &&
            scores.map((score, index) => (
              
              <div className="score-container1" {...(!props.Admin && {
    onClick: () => handleClick("score", score._id),
  })} key={index}>
                
                {props.Admin && (
                  <>
                    <div className="delete-container">
<FaEye
  className="view-icon"
  onClick={() => handleClick("score", score._id)}
/>
                       <FaTrash
                        className="delete-icon"
                        onClick={() => handleDelete(score._id)}
                      />
                    </div>
                    
                    <div className="line"></div>
                  </>
                )}

                {/* Live Tag */}
                <div className="Tag">
                  <div className="First">
                    <div className="upcoming">
                      MATCH {scores.length - index}
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
            ))}

          {/*Section 5 : Pointtable */}
          {activeSection === "pointtable" && pointsTable?.length > 0 && scores && (
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

          {activeSection === "Leaderboard" && (
            <Stars />
          )}

          {/*Section 5 :  settings */}
          {activeSection === "setting" && props.Admin && (
            <div>
              <div
                className="score-board-settings"
                onClick={() => handleClick("new")}
              >
                NEW Match
              </div>
              {props.newMatch && (
                <div
                  className="score-board-settings1"
                  onClick={handleReset}
                >
                  RESET
                </div>
              )}
              <div
                className="score-board-settings"
                onClick={() => handleClick("edit")}
              >
                {/* edit */}
                EDIT Passward
              </div>
               <div
                className="score-board-settings"
                onClick={() => handleClick("photo")}
              >
                {/* edit */}
                PHOTOS
              </div>
               <div
                className="score-board-settings"
                onClick={() => handleClick("advertise")}
              >
                {/* edit */}
                ADVERTISE
              </div>
              <div
                className="score-board-settings"
                onClick={() => handleClick("add")}
              >
                {/* add */}
                SETUP
              </div>
              <div
                className="score-board-settings"
                onClick={() => handleClick("help")}
              >
                HELP
              </div>
              <div
                className="score-board-settings"
                onClick={() => handleClick("help")}
              >
                CONTACT
              </div>
              <div
                className="score-board-settings1"
                onClick={() => handleClick("logout")}
              >
                LOGOUT
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScoreBoard;
