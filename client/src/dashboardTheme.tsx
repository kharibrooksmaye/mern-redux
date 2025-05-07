import { createTheme } from "@mui/material";

const colors = {
  color1: "#5C2849",
  color2: "#A73E5C",
  color3: "#EC4863",
  color4: "#FFDA66",
  color5: "#1FCECB",
};

const font = "'DM Sans', sans-serif";
const logoFont = "'Poppins', sans-serif";
export const dashboardTheme = createTheme({
  palette: {
    mode: "light",
    background: {
      default: "#F5F5F5",
      paper: "#FFFFFF",
    },
    primary: {
      light: "#D3FBF9",
      main: "#b2ebf2",
      dark: "#5997AE",
    },
    secondary: {
      light: "#FFEDA3",
      main: "#FFDA66",
      dark: "#B79133",
    },
    warning: {
      light: "#F9E2A9",
      main: "#ECBE6E",
      dark: "#A97737",
    },
    error: {
      light: "#FFC4A7",
      main: "#FF886D",
      dark: "#B73B36",
    },
    success: {
      light: "#9EE293",
      main: "#43a047",
      dark: "#217333",
    },
    text: {
      primary: "#000000",
      secondary: "#FFFFFF",
    },
  },
  typography: {
    fontSize: 14,
    body1: {
      fontSize: "1rem",
    },
    fontFamily: font,
    fontWeightRegular: 400,
    fontWeightBold: 700,
    fontWeightLight: 100,
    fontWeightMedium: 500,
  },
});

export const darkDashboardTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#121212",
      paper: "#1E1E1E",
    },
    primary: {
      light: "#4A8A9E",
      main: "#357A8A",
      dark: "#1F4F5E",
    },
    secondary: {
      light: "#BFA14D",
      main: "#A37F3A",
      dark: "#6E5826",
    },
    warning: {
      light: "#D1B06E",
      main: "#B38E4E",
      dark: "#7A6235",
    },
    error: {
      light: "#D97A6A",
      main: "#B55A4D",
      dark: "#7A3A31",
    },
    success: {
      light: "#7FBF7A",
      main: "#5A9F55",
      dark: "#3A6F37",
    },
  },
  typography: {
    fontSize: 14,
    body1: {
      fontSize: "1rem",
    },
    fontFamily: font,
    fontWeightRegular: 400,
    fontWeightBold: 700,
    fontWeightLight: 100,
    fontWeightMedium: 500,
  },
});
