import React from "react";
import { Button, ButtonBase } from "@mui/material";
const CommonButton = ({
  children,
  color,
  disabled,
  size,
  sx,
  variant,
}: {
  children: React.ReactNode;
  color?:
    | "inherit"
    | "primary"
    | "secondary"
    | "success"
    | "error"
    | "info"
    | "warning"
    | undefined;
  disabled?: boolean | undefined;
  size?: "small" | "medium" | "large" | undefined;
  sx?: object;
  variant?: "text" | "outlined" | "contained" | undefined;
}) => {
  return (
    <Button
      disabled={disabled}
      color={color}
      size={size}
      sx={sx}
      variant={variant}
    >
      {children}
    </Button>
  );
};

export default CommonButton;
