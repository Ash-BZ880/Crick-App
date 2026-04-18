import { ThemeProvider } from "@material-ui/core";
import React from "react";
import { BrowserRouter } from "react-router-dom";

import { theme } from "./components/ui/Theme";
import Container from "./main/Container";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <Container />
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;