import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Auth } from "../@types/auth";

export const useAuth = () => {
  const auth = useContext(AuthContext) as Auth;
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const authenticate = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/authenticated",
          {
            withCredentials: true,
          }
        );
        if (response.status === 200) {
          const {
            data: { user, token },
          } = response;
          setIsAuthenticated(true);
          auth.setUser(user);
          auth.setLoggedIn(true);
        }
      } catch (error) {
        console.error("Error during authentication:", error);
        auth.setLoggedIn(false);
        setIsAuthenticated(false);
      }
    };
    authenticate();
  }, []);

  return isAuthenticated;
};
