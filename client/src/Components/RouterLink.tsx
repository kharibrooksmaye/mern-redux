import {
  Box,
  Divider,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import React, { ReactNode } from "react";
import { NavLink, NavLinkProps } from "react-router-dom";

type RouterLinkProps = React.PropsWithChildren<{
  to: string;
  text: string;
  icon: ReactNode;
}>;

const RouterLink = (props: RouterLinkProps) => {
  type MyNavLinkProps = Omit<NavLinkProps, "to">;
  const MyNavLink = React.useMemo(
    () =>
      React.forwardRef<HTMLAnchorElement, MyNavLinkProps>(
        (navLinkProps, ref) => {
          const { className: previousClasses, ...rest } = navLinkProps;
          const elementClasses = previousClasses?.toString() ?? "";

          return (
            <NavLink
              {...rest}
              ref={ref}
              to={props.to}
              end
              className={({ isActive }) => {
                console.log(isActive);
                return isActive
                  ? elementClasses + " Mui-selected"
                  : elementClasses;
              }}
            />
          );
        }
      ),
    [props.to]
  );

  const strippedPathname = location.pathname.replace("/", "");
  const activeLink = props.to === strippedPathname;
  console.log(strippedPathname, props.to);
  return (
    <Box sx={{ display: "flex" }}>
      <ListItemButton
        sx={{
          margin: "5px 0px",
          fontWeight: "700",
          backgroundColor: activeLink ? "transparent !important" : "inherit",

          "&:hover": {
            backgroundColor: "transparent",
            fontWeight: "fontWeightBold",
          },
        }}
        component={MyNavLink}
        disableRipple
        selected={props.to === location.pathname}
      >
        <ListItemIcon
          sx={{
            ".Mui-selected > &": { color: "primary.dark" },
            color: "#bbb",
          }}
        >
          {props.icon}
        </ListItemIcon>
        <ListItemText
          primaryTypographyProps={{
            fontWeight:
              props.to === strippedPathname
                ? "fontWeightBold"
                : "fontWeightRegular",
          }}
          primary={props.text}
        />
      </ListItemButton>
      {activeLink && (
        <Divider
          orientation="vertical"
          sx={{
            borderWidth: "3px",
            borderRadius: "3px",
            borderColor: "primary.dark",
            margin: "revert",
          }}
          flexItem
        />
      )}
    </Box>
  );
};

export default RouterLink;
