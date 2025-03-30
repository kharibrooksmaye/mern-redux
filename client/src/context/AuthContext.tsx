import { min } from "moment";
import { createContext, FC, ReactNode, useEffect, useState } from "react";
import { Auth } from "../@types/auth";
import { User } from "../@types/user";
import { useLocation, useNavigate } from "react-router-dom";
import { useFetch } from "../Helpers/functions";
import axios from "axios";

export const AuthContext = createContext<Auth | null>(null);

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState<User>(null);
  const [token, setToken] = useState<Auth["token"]>(null);
  const [loggedIn, setLoggedIn] = useState<Auth["loggedIn"]>(false);
  const [isLoading, setIsLoading] = useState(false);
  const login = ({ user, authToken }: { user: User; authToken: string }) => {
    setUser(user);
    console.log("setting logged in to true from login function");
    setLoggedIn(true);
    if (user?._id && authToken) {
      navigate("/profile");
    }
  };

  const logout = () => {
    setIsLoading(true);
    try {
      axios.get("http://localhost:5000/api/logout", {
        withCredentials: true,
      });
    } catch (error) {
      console.error("Error during logout:", error);
    }
    setUser(null);
    setToken(null);
    setLoggedIn(false);
    setIsLoading(false);
    navigate("/");
  };

  useEffect(() => {
    const authenticate = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          "http://localhost:5000/api/authenticated",
          {
            withCredentials: true,
          }
        );
        if (response.status === 200) {
          const { user, token } = response.data;
          setUser(user);
          setToken(token);
          setLoggedIn(true);
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error during authentication:", error);
        setIsLoading(false);
        return;
      }
    };
    authenticate();
  }, []);

  const authObject = {
    loggedIn,
    token,
    user,
    login,
    logout,
    setUser,
    isLoading,
  };
  return (
    <AuthContext.Provider value={authObject}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
