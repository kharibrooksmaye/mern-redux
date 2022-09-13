import { useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import Navbar from "./Components/Navbar";
import { Outlet } from "react-router";
import Home from "./Pages/Home/Home";
import { Box } from "@mui/material";
import AuthProvider from "./context/AuthContext";

function App() {
  const [count, setCount] = useState(0);

  return (
    <AuthProvider>
      <Box
        sx={{
          marginLeft: `250px`,
          height: "100vh",
          backgroundColor: "#F4F7FE",
          padding: "30px",
        }}
        className="App"
      >
        <Navbar />
        <Outlet />
      </Box>
    </AuthProvider>
  );
}

export default App;
