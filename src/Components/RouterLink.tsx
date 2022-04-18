import { ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
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
              className={({ isActive }) =>
                isActive ? elementClasses + " Mui-selected" : elementClasses
              }
            />
          );
        }
      ),
    [props.to]
  );

  return (
    <ListItemButton
      sx={{
        "&.Mui-selected": {
          backgroundColor: "primary.main",
        },
        borderRadius: "8px",
        margin: "5px 0px",
        "&:hover": {
          backgroundColor: "#eee",
        },
      }}
      component={MyNavLink}
      disableRipple
    >
      <ListItemIcon
        sx={{
          ".Mui-selected > &": { color: "primary.dark" },
          color: "#bbb",
        }}
      >
        {props.icon}
      </ListItemIcon>
      <ListItemText primary={props.text} />
    </ListItemButton>
  );
};

export default RouterLink;
