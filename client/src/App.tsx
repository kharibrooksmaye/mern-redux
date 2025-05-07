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
  ThemeProvider,
} from "@mui/material";
import { Link } from "react-router-dom";
import AuthProvider, { AuthContext } from "./context/AuthContext";
import { Auth } from "./@types/auth";
import { headerItems } from "./Components/Constants/navbarItems";
import Header from "./Components/Header";
import { darkDashboardTheme, dashboardTheme } from "./dashboardTheme";

function App() {
  const [count, setCount] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const authContext = useContext(AuthContext) as Auth;

  const theme = darkMode ? darkDashboardTheme : dashboardTheme;
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
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          marginLeft: `250px`,
          backgroundColor: theme.palette.background.default,
          padding: "30px",
        }}
        className="App"
      >
        <Box sx={{ marginBottom: "80px" }}>
          <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
          {isLoading ? loadingScreen : <Outlet />}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
