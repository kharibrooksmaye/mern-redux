import React, { useContext } from "react";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import { navbarItems } from "./Constants/navbarItems";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import ResponsiveAppBar from "./ResponsiveAppbar";
import RouterLink from "./RouterLink";
import { useAuth } from "../hooks/useAuth";

const Navbar = () => {
  const isAuthenticated = useAuth("Navbar"); // Get authentication status from context
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
        <List sx={{ marginTop: "130px" }}>
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
