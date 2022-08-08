import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import logo from "../assets/logo.svg";
import { useNavigate } from "react-router";
import { AuthContext } from "../context/AuthContext";
import { Auth } from "../@types/auth";
import React from "react";

const ResponsiveAppBar = ({
  setOpen,
  open,
  drawerWidth,
}: {
  open: boolean;
  setOpen: Function;
  drawerWidth: number;
}) => {
  const { loggedIn, logout } = React.useContext(AuthContext) as Auth;
  const navigate = useNavigate();

  const pages = [
    { label: "Home", route: "" },
    {
      label: "Products",
      route: "products",
    },
    {
      label: "Pricing",
      route: "pricing",
    },
    {
      label: "Blog",
      route: "blog",
    },
  ];

  const settings = loggedIn
    ? [
        { label: "Profile", route: "profile" },
        { label: "Account", route: "account" },
        { label: "Dashboard", route: "dashboard" },
        { label: "Logout", route: "logout" },
      ]
    : [{ label: "Login", route: "login" }];

  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(
    null
  );
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(
    null
  );

  const handleOpenNavMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = (link: string) => {
    navigate(link);
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = (link: string) => {
    if (link === "logout") {
      logout();
      setAnchorElUser(null);
      navigate("/");
    } else {
      navigate(link);
      setAnchorElUser(null);
    }
  };

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: "transparent",
        boxShadow: "none",
        marginLeft: `${drawerWidth}px`,
        width: `calc(100% - ${drawerWidth}px)`,
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Box
            sx={{
              flexGrow: 1,
              display: { xs: "flex", md: "none" },
            }}
          >
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={() => setOpen(true)}
              color="primary"
            >
              <MenuIcon />
            </IconButton>
          </Box>

          <Box
            sx={{
              flexGrow: 1,
              marginLeft: "20px",
              display: { xs: "none", md: "flex" },
              justifyContent: "flex-end",
            }}
          >
            {pages.map((page) => (
              <Button
                key={page.label}
                onClick={() => handleCloseNavMenu(page.route)}
                sx={{
                  my: 2,
                  mr: 1,
                  display: "block",
                  backgroundColor: "primary.main",
                  color: "primary.dark",
                  "&: hover": {
                    backgroundColor: "primary.light",
                    fontWeight: 700,
                  },
                }}
              >
                {page.label}
              </Button>
            ))}
          </Box>

          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt="Remy Sharp" src="/static/images/avatar/2.jpg" />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: "45px" }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {settings.map((setting) => (
                <MenuItem
                  key={setting.label}
                  onClick={() => handleCloseUserMenu(setting.route)}
                >
                  <Typography textAlign="center">{setting.label}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
export default ResponsiveAppBar;
