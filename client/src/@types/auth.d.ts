import { User } from "./user";

export interface Auth {
  loggedIn: boolean;
  user: User;
  token: string | null;
  login: Function;
  logout: Function;
  setUser: Function;
  isLoading: boolean;
}
