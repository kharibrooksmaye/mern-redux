import { AppBar, Button, Toolbar, Typography } from "@mui/material";
import React from "react";
import { headerItems } from "./Constants/navbarItems";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <AppBar position="fixed" sx={{ zIndex: 1201, backgroundColor: "#1976d2" }}>
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, fontWeight: "bold" }}
        >
          My App
        </Typography>
        {headerItems.map((link, index) => (
          <Button key={index} color="inherit" component={Link} to={link.to}>
            {link.label}
          </Button>
        ))}
        <Button
          color="secondary"
          variant="contained"
          component={Link}
          to="/get-started"
          sx={{ marginLeft: "10px" }}
        >
          Get Started
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
