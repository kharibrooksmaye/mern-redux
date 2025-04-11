import React, { useContext } from "react";
import Drawer from "@mui/material/Drawer";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import { navbarItems } from "./Constants/navbarItems";
import RouterLink from "./RouterLink";
import { AuthContext } from "../context/AuthContext";
import { NavLink, useNavigate } from "react-router-dom";
import { AppBar, Box, Typography } from "@mui/material";
import ResponsiveAppBar from "./ResponsiveAppbar";
import logo from "../assets/logo.svg";
import { Auth } from "../@types/auth";
import { useAuth } from "../hooks/useAuth";

const Navbar = () => {
  const isAuthenticated = useAuth(); // Get authentication status from context
  const drawerWidth = 250;
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);

  return (
    <Box>
      <ResponsiveAppBar
        drawerWidth={drawerWidth}
        open={open}
        setOpen={setOpen}
      />
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            color: "primary.dark",
            border: "none",
          },
        }}
        variant="persistent"
        anchor="left"
        open
        onClose={() => setOpen(false)}
      >
        <Toolbar>
          <Box
            sx={{
              padding: "10px 10px",
              cursor: "pointer",
              display: "inline-flex",
              height: "130px",
              alignItems: "center",
            }}
            onClick={() => navigate("/")}
          >
            <Typography fontWeight="700" textTransform="uppercase" variant="h5">
              Khari
            </Typography>
            <Typography fontWeight="300" textTransform="uppercase" variant="h5">
              Dev
            </Typography>
          </Box>
        </Toolbar>
        <Divider />
        <List>
          {navbarItems.map((item) => {
            if (item.protected) {
              return (
                isAuthenticated && (
                  <RouterLink
                    key={item.id}
                    to={item.route}
                    text={item.label}
                    icon={item.icon}
                  />
                )
              );
            } else {
              return (
                <RouterLink
                  key={item.id}
                  to={item.route}
                  text={item.label}
                  icon={item.icon}
                />
              );
            }
          })}
        </List>
      </Drawer>
    </Box>
  );
};

export default Navbar;
