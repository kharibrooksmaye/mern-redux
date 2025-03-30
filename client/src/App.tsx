import { useContext, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import Navbar from "./Components/Navbar";
import { Outlet } from "react-router";
import Home from "./Pages/Home/Home";
import { Box, CircularProgress } from "@mui/material";
import AuthProvider, { AuthContext } from "./context/AuthContext";
import { Auth } from "./@types/auth";

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
        height: "100vh",
        backgroundColor: "#F4F7FE",
        padding: "30px",
      }}
      className="App"
    >
      <Navbar />
      {isLoading ? loadingScreen : <Outlet />}
    </Box>
  );
}

export default App;
