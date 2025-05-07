import React, { createContext, useContext, useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  Outlet,
  useLocation,
} from "react-router-dom";
import Users from "./Pages/Users/Users";
import Samples from "./Pages/Samples/Samples";
import Organizations from "./Pages/Organizations/Organizations";
import Settings from "./Pages/Settings/Settings";
import { Box, CircularProgress, ThemeProvider } from "@mui/material";
import { dashboardTheme } from "./dashboardTheme";
import Home from "./Pages/Home/Home";
import Login from "./Components/Login";
import AuthProvider, { AuthContext } from "./context/AuthContext";
import Profile from "./Components/Profile";
import Products from "./Components/Products";
import Blog from "./Components/Blog";
import Pricing from "./Components/Pricing";
import Register from "./Components/Register";
import { Auth } from "./@types/auth";
import { useAuth } from "./hooks/useAuth";
import About from "./Pages/About";
import Contact from "./Pages/Contact";
import DemoStatus from "./Pages/Demo";

const PrivateRoute = ({ children }: { children?: JSX.Element | undefined }) => {
  const auth = useContext(AuthContext) as Auth;
  const isAuthenticated = useAuth("PrivateRoute");
  const location = useLocation();
  if (isAuthenticated === null) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }
  return isAuthenticated ? (
    children || <Outlet />
  ) : (
    <Navigate to={{ pathname: "/login" }} state={{ from: location }} />
  );
};

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/" element={<App />}>
          <Route path="/" element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="blog" element={<Blog />} />
          <Route path="products" element={<Products />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="demo" element={<DemoStatus />} />
          <Route element={<PrivateRoute />}>
            <Route path="users" element={<Users />} />
            <Route path="samples" element={<Samples />} />
            <Route path="organizations" element={<Organizations />} />
            <Route path="settings" element={<Settings />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);
