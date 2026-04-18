import { useState, useEffect, useRef } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";

import NotFound from "../components/NotFound/NotFound";
import StepperContainer from "../components/StepperContainer";
import ScoreBoard from "../components/ScoreBoard";
import LandingPage from "../components/HomePage/HomePage";
import LoginSignUp from "../components/LoginSignUp/LoginSignUp";
import EditPass from "../components/Passward/EditPass";
import Form from "../components/Form/Form";
import TossFlip from "../components/TossFlip/TossFlip";
import HelpContact from "../components/Help/HelpContact";
import Photo from "../components/Photos/Photo";
import Scorecard from "../components/Scorecards/Scorecard";
import Stars from "../components/LeaderBoard/Stars";
import AdvertiseSetup from "../components/AdvertiseSetup/AdvertiseSetup";

import { Fab } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
// import { Leaderboard } from "@mui/icons-material";

const Main = () => {
  const [toss, setToss] = useState();
  const [win, setWin] = useState();
  const [Globalstate, setGlobalstate] = useState(true);
  const [newMatch, setNewMatch] = useState(false);

  const [isAdmin, setIsAdmin] = useState(() => {
    const stored = localStorage.getItem("isAdmin");
    return stored ? JSON.parse(stored) : false;
  });

  const [showScrollTop, setShowScrollTop] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const containerRef = useRef(null);

  // ✅ Persist admin
  useEffect(() => {
    localStorage.setItem("isAdmin", JSON.stringify(isAdmin));
  }, [isAdmin]);

  // ✅ Persist new match
  useEffect(() => {
    localStorage.setItem("newMatch", JSON.stringify(newMatch));
  }, [newMatch]);

  // ✅ Load toss + winner
  useEffect(() => {
    const savedToss = localStorage.getItem("toss");
    const savedWinner = localStorage.getItem("win");
    if (savedToss) setToss(savedToss);
    if (savedWinner) setWin(savedWinner);
  }, []);

  // ✅ Save toss + winner
  useEffect(() => {
    if (toss) localStorage.setItem("toss", toss);
    if (win) localStorage.setItem("win", win);
  }, [toss, win]);

  // ✅ Scroll detection
  useEffect(() => {
    const container = containerRef.current;

    const handleScroll = () => {
      if (container.scrollTop > 100) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    if (container) {
      container.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  // ✅ Scroll to top
  const scrollToTop = () => {
    containerRef.current?.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  // ✅ Back button logic
const handleBack = () => {
  if (isAdmin) {
    if (
      [
        "/form",
        "/EditPassward",
        "/MatchData",
        "/help",
        "/Photos",
        "/Advertise",
        "/Leaderboard"
      ].includes(location.pathname) ||
      location.pathname.startsWith("/scorecard/")
    ) {
      navigate("/score");
    }
  } else {
    if (
      [
        "/score",
        "/Toss",
        "/help",
        "/LoginSignUp",
        "/Leaderboard"
      ].includes(location.pathname) 
    ) {
      navigate("/");
    } else if (location.pathname.startsWith("/scorecard/")) {
      navigate("/score")
    }
  }
};

  return (
    <div
      ref={containerRef}
      id="main-scroll-container"
      style={{
        height: "100vh",
        overflowY: "auto",
        position: "relative",
        backgroundColor: "white"
      }}
    >
      {/* ✅ SMART BUTTON */}
      {location.pathname !== "/" && (
        <Fab
          color="primary"
          onClick={showScrollTop ? scrollToTop : handleBack}
          style={{
            position: "fixed",
            bottom: "40px",
            right: "30px",
            zIndex: 1000,
            height: "45px",
            width: "45px"
          }}
        >
          {showScrollTop ? <KeyboardArrowUpIcon /> : <ArrowBackIcon />}
        </Fab>
      )}

      <Routes>
        <Route
          path="/"
          element={
            <LandingPage
              Admin={isAdmin}
              setIsAdmin={setIsAdmin}
              setNewMatch={setNewMatch}
            />
          }
        />

        <Route path="/Toss" element={<TossFlip />} />

        <Route
          path="/form"
          element={
            <StepperContainer
              toss={toss}
              win={win}
              setToss={setToss}
              setWin={setWin}
              Globalstate={Globalstate}
              setGlobalstate={setGlobalstate}
              newMatch={newMatch}
              setNewMatch={setNewMatch}
            />
          }
        />

        <Route
          path="/score"
          element={
            <ScoreBoard
              toss={toss}
              win={win}
              Globalstate={Globalstate}
              Admin={isAdmin}
              setAdmin={setIsAdmin}
              newMatch={newMatch}
              setNewMatch={setNewMatch}
            />
          }
        />

        <Route
          path="/LoginSignUp"
          element={
            <LoginSignUp Admin={isAdmin} setIsAdmin={setIsAdmin} />
          }
        />

        <Route path="/EditPassward" element={<EditPass />} />

        <Route path="/MatchData" element={<Form />} />

        <Route path="/help" element={<HelpContact />} />

        <Route path="/Photos" element={<Photo />} />

        <Route path="/Advertise" element={<AdvertiseSetup/>}/>
        
        <Route path="/scorecard/:id" element={<Scorecard/>} />

        <Route path="/Leaderboard" element={<Stars/>}/>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

export default Main;