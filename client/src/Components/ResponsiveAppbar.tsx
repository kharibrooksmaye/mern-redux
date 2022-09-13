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
import {
  Breadcrumbs,
  InputAdornment,
  Link,
  Paper,
  styled,
  TextField,
} from "@mui/material";
import {
  BedtimeOutlined,
  InfoOutlined,
  Notifications,
  NotificationsOutlined,
  Search,
} from "@mui/icons-material";
import { InputUnstyled, InputUnstyledProps } from "@mui/base";

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

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
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

  const StyledInputRoot = styled("div")(
    ({ theme }) => `
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 30px;
    background-color: #F4F7FE;
    background: #F4F7FE;
    `
  );

  const StyledInput = styled("input")(
    ({ theme }) => `
    background-color: #F4F7FE;
    background: #F4F7FE;
    border: none;
    border-radius: 30px;
    height: 41px;
    padding: 0 10px;
    flex-grow: 1;
    width: 100%;
    display: flex;
    outline: none;
    `
  );

  const InputAdornment = styled("div")`
    margin: 8px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  `;

  const CustomInput = React.forwardRef(function CustomInput(
    props: InputUnstyledProps,
    ref: React.ForwardedRef<HTMLDivElement>
  ) {
    const { components, ...other } = props;
    return (
      <InputUnstyled
        components={{
          Root: StyledInputRoot,
          Input: StyledInput,
          ...components,
        }}
        {...other}
        ref={ref}
      />
    );
  });

  const pathname = location.pathname.replace("/", "");
  const currentPage = `${pathname.charAt(0).toUpperCase()}${pathname.slice(1)}`;
  console.log(currentPage);
  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: "transparent",
        boxShadow: "none",
        marginBottom: "20px",
      }}
    >
      <Toolbar sx={{ marginTop: "16px" }}>
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
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-start",
          }}
        >
          <Box sx={{ flexDirection: "column", display: "flex" }}>
            <Breadcrumbs>
              <Link underline="hover" color="GrayText" href="/">
                Home
              </Link>
              {location.pathname !== "/" && (
                <Link
                  underline="none"
                  color="primary.dark"
                  href={location.pathname}
                >
                  {currentPage}
                </Link>
              )}
            </Breadcrumbs>
            <Typography variant="h4" fontWeight={700}>
              NFT Marketplace
            </Typography>
          </Box>
        </Box>

        {/* <Box
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
          </Box> */}
        <Box
          sx={{
            flexGrow: 1,
            justifyContent: "flex-end",
            display: "flex",
            "& > * + *": { ml: 1 },
          }}
        >
          <Paper
            elevation={3}
            sx={{
              borderRadius: "30px",
              border: "0px solid black",
              outline: "none",
              borderColor: "transparent",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              padding: "10px",
              "& > * + *": { ml: 1 },
            }}
          >
            <CustomInput
              type="text"
              placeholder="Search"
              startAdornment={
                <InputAdornment>
                  <Search />
                </InputAdornment>
              }
            />
            <IconButton>
              <NotificationsOutlined fontSize="small" />
            </IconButton>
            <IconButton>
              <BedtimeOutlined fontSize="small" />
            </IconButton>
            <IconButton>
              <InfoOutlined fontSize="small" />
            </IconButton>
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
          </Paper>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
export default ResponsiveAppBar;
