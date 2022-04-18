import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Users from "./Pages/Users/Users";
import Samples from "./Pages/Samples/Samples";
import Organizations from "./Pages/Organizations/Organizations";
import Settings from "./Pages/Settings/Settings";
import { ThemeProvider } from "@mui/material";
import { dashboardTheme } from "./dashboardTheme";
import Home from "./Pages/Home/Home";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ThemeProvider theme={dashboardTheme}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route path="/" element={<Home />} />
          <Route path="users" element={<Users />} />
          <Route path="samples" element={<Samples />} />
          <Route path="organizations" element={<Organizations />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </ThemeProvider>
);
