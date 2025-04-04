import {
  AlertColor,
  AlertPropsColorOverrides,
  AlertPropsVariantOverrides,
} from "@mui/material";
import { User } from "./user";

export interface Auth {
  loggedIn: boolean;
  user: User;
  token: string | null;
  login: Function;
  logout: Function;
  setUser: Function;
  isLoading: boolean | null;
  message: { type: AlertColor; content: string } | null;
  setMessage: Function;
  setToken: Function;
  setLoggedIn: Function;
}
