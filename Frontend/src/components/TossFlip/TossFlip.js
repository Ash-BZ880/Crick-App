import { useState } from 'react';
import './TossFlip.css';
import { AppBar, Toolbar, Typography, Button } from "@mui/material";

const TossFlip = () => {
  const [tossResult, setTossResult] = useState('');
  const [tossImage, setTossImage] = useState('/images/Photo6.jpg');
  const [phase, setPhase] = useState("idle"); // idle | blur | clear | stop

  const handleFlip = () => {
    setPhase("blur");
    setTossResult("");

    // Phase 1 → Blur spin
    setTimeout(() => {
      setPhase("clear");
    }, 700);

    // Phase 2 → Clear spin
    setTimeout(() => {
      const result = Math.random() < 0.5 ? 'H e a d' : 'T a i l';
      const image =
        result === 'H e a d'
          ? '/images/Photo6.jpg'
          : '/images/Photo5.jpg';

      setTossImage(image);
      setTossResult(result);
      setPhase("stop");
    }, 1500);
  };

  return (
    <div className="container9">
      <AppBar position="fixed" className="appbar">
        <Toolbar>
          <Typography variant="h6">WELCOME</Typography>
        </Toolbar>
      </AppBar>

      <div className="content">
        <img
          src={tossImage}
          alt=""
          className={`image 
            ${phase === "blur" ? "blur spin-fast" : ""}
            ${phase === "clear" ? "spin-slow" : ""}
          `}
        />

        <h1 className="text">
          {phase === "stop" ? tossResult : ""}
        </h1>

        <Button
          variant="contained"
          className="flip-btn"
          onClick={handleFlip}
          disabled={phase !== "idle" && phase !== "stop"}
        >
          Flip Toss
        </Button>
      </div>
    </div>
  );
};

export default TossFlip;