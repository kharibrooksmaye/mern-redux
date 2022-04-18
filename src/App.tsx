import { useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import Navbar from "./Components/Navbar";
import { Outlet } from "react-router";
import Home from "./Pages/Home/Home";
import { Box } from "@mui/material";

function App() {
  const [count, setCount] = useState(0);

  return (
    <Box sx={{ marginLeft: `250px` }} className="App">
      <Navbar />
      <Outlet />
    </Box>
  );
}

export default App;
