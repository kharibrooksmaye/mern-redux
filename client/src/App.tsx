import { useContext, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import Navbar from "./Components/Navbar";
import { Outlet } from "react-router";
import Home from "./Pages/Home/Home";
import {
  Box,
  CircularProgress,
  AppBar,
  Toolbar,
  Typography,
  Button,
} from "@mui/material";
import { Link } from "react-router-dom";
import AuthProvider, { AuthContext } from "./context/AuthContext";
import { Auth } from "./@types/auth";
import { headerItems } from "./Components/Constants/navbarItems";
import Header from "./Components/Header";

function App() {
  const [count, setCount] = useState(0);
  const authContext = useContext(AuthContext) as Auth;

  const loadingScreen = (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <CircularProgress size="3x" />
    </Box>
  );

  if (!authContext) {
    console.error("AuthContext is not provided or is undefined.");
    return loadingScreen; // Or render an error message/component
  }
  const { isLoading } = authContext;

  return (
    <Box
      sx={{
        marginLeft: `250px`,
        backgroundColor: "#F4F7FE",
        padding: "30px",
      }}
      className="App"
    >
      <Box sx={{ marginBottom: "80px" }}>
        <Navbar />
        {isLoading ? loadingScreen : <Outlet />}
      </Box>
    </Box>
  );
}

export default App;
