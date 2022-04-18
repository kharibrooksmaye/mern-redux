import { createTheme } from "@mui/material";

const colors = {
  color1: "#5C2849",
  color2: "#A73E5C",
  color3: "#EC4863",
  color4: "#FFDA66",
  color5: "#1FCECB",
};

const font = "'Varela Round', sans-serif";
export const dashboardTheme = createTheme({
  palette: {
    primary: {
      lighter: "#F0FEFB",
      light: "#D3FBF9",
      main: "#b2ebf2",
      dark: "#5997AE",
      darker: "#225074",
    },
    secondary: {
      lighter: "#FFFAE0",
      light: "#FFEDA3",
      main: "#FFDA66",
      dark: "#B79133",
      darker: "#7A5713",
    },
    warning: {
      lighter: "#FEF8E2",
      light: "#F9E2A9",
      main: "#ECBE6E",
      dark: "#A97737",
      darker: "#714115",
    },
    error: {
      lighter: "#FFF0E1",
      light: "#FFC4A7",
      main: "#FF886D",
      dark: "#B73B36",
      darker: "#7A1420",
    },
    success: {
      lighter: "#E6FADD",
      light: "#9EE293",
      main: "#43a047",
      dark: "#217333",
      darker: "#0C4C26",
    },
  },
  typography: {
    fontSize: 14,
    body1: {
      fontSize: "1rem",
    },
    fontFamily: font,
  },
});
