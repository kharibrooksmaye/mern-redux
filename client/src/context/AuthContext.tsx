import { min } from "moment";
import { createContext, FC, ReactNode, useEffect, useState } from "react";
import { Auth } from "../@types/auth";
import { User } from "../@types/user";
import { useLocation, useNavigate } from "react-router-dom";

export const AuthContext = createContext<Auth | null>(null);

interface LocationState {
  from: {
    pathname: string;
  };
}

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const { state } = useLocation();

  const [user, setUser] = useState<User>(null);
  const [token, setToken] = useState<Auth["token"]>(null);
  const [loggedIn, setLoggedIn] = useState<Auth["loggedIn"]>(false);
  const login = ({ user, token }: { user: User; token: Auth["token"] }) => {
    setUser(user);
    setToken(token);
    setLoggedIn(true);
    user?._id && token && navigate("/profile");
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setLoggedIn(false);
  };

  const authObject = {
    loggedIn,
    token,
    user,
    login,
    logout,
    setUser,
  };

  useEffect(() => {
    console.log(user);
  }, [user]);
  return (
    <AuthContext.Provider value={authObject}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
