// Done
import { useEffect } from "react";
// import { useLocation } from "react-router-dom";
// import { useState, useEffect } from "react";
import { AppBar, Box, Container, Toolbar, Typography } from '@material-ui/core';
import HorizontalStepper from './HorizontalStepper';

const StepperContainer = ({ toss, win, setToss, setWin, Globalstate, setGlobalstate,newMatch,setNewMatch}) => {

  useEffect(() => {
    if (newMatch) {
      console.log("✅ New match triggered!");
      // Do whatever setup is needed
      console.log(newMatch)
    }
  }, [newMatch]);

  return (
    <div>
      <AppBar position="fixed">
      <Toolbar
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <Typography variant="h6">WELCOME</Typography>
    </Toolbar>
      </AppBar>
      <Container>
        <Box marginTop={10}>
          <HorizontalStepper 
            toss={toss} 
            win={win} 
            setToss={setToss} 
            setDecision={setWin} 
            Globalstate={Globalstate}
            setGlobalstate={setGlobalstate}
            newMatch={newMatch}
            setNewMatch={setNewMatch}
          />
        </Box>
      </Container>
    </div>
  );
};

export default StepperContainer;
