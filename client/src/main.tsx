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
} from "react-router-dom";
import Users from "./Pages/Users/Users";
import Samples from "./Pages/Samples/Samples";
import Organizations from "./Pages/Organizations/Organizations";
import Settings from "./Pages/Settings/Settings";
import { ThemeProvider } from "@mui/material";
import { dashboardTheme } from "./dashboardTheme";
import Home from "./Pages/Home/Home";
import Login from "./Components/Login";
import { Auth, authContext } from "./AuthContext";
import Profile from "./Components/Profile";
import Products from "./Components/Products";
import Blog from "./Components/Blog";
import Pricing from "./Components/Pricing";
import Register from "./Components/Register";

const PrivateRoute = ({ children }: { children?: JSX.Element | undefined }) => {
  let auth = useContext(authContext);

  return auth?.user?.id && auth?.jwt ? (
    children || <Outlet />
  ) : (
    <Navigate to={{ pathname: "/login" }} state={{ from: location }} />
  );
};
const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <ThemeProvider theme={dashboardTheme}>
    <Auth>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />}>
            <Route path="/" element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="blog" element={<Blog />} />
            <Route path="products" element={<Products />} />
            <Route path="pricing" element={<Pricing />} />
            <Route element={<PrivateRoute />}>
              <Route path="users" element={<Users />} />
              <Route path="samples" element={<Samples />} />
              <Route path="organizations" element={<Organizations />} />
              <Route path="settings" element={<Settings />} />
              <Route path="settings" element={<Settings />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </Auth>
  </ThemeProvider>
);
