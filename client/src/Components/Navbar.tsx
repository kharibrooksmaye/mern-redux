import React, { useContext } from "react";
import Drawer from "@mui/material/Drawer";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import MailIcon from "@mui/icons-material/Mail";
import { navbarItems } from "./Constants/navbarItems";
import { NavLink, useNavigate } from "react-router-dom";
import { AppBar, Box, Typography } from "@mui/material";
import ResponsiveAppBar from "./ResponsiveAppbar";
import RouterLink from "./RouterLink";
import logo from "../assets/logo.svg";
import { AuthContext } from "../context/AuthContext";
import { Auth } from "../@types/auth";

const Navbar = () => {
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
          {navbarItems.map((item) => (
            <RouterLink
              key={item.id}
              to={item.route}
              text={item.label}
              icon={item.icon}
            />
          ))}
        </List>
        {/* <Divider />
        <List>
          {["All mail", "Trash", "Spam"].map((item, index) => (
            <ListItem button key={item}>
              <ListItemIcon>
                {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
              </ListItemIcon>
              <ListItemText primary={item} />
            </ListItem>
          ))}
        </List> */}
      </Drawer>
    </Box>
  );
};

export default Navbar;
