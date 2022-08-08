import React, { createContext, useState } from "react";

interface AuthContextState {
  user: { username: string | null; id: number | null };
  jwt: string | undefined;
  signIn(data: any): void;
  signOut(): void;
}
const authContext = createContext({} as AuthContextState);

const Auth = ({ children }: { children: JSX.Element }) => {
  const authObject = getAuthObject();

  return (
    <authContext.Provider value={authObject}>{children}</authContext.Provider>
  );
};

const getAuthObject = () => {
  const [user, setUser] = useState({ username: "", id: null });
  const [jwt, setJWT] = useState(undefined);

  const signIn = (data: any) => {
    const {
      user: { username, id },
      jwt,
    } = data;
    setUser({
      username,
      id,
    });
    setJWT(jwt);
  };

  const signOut = () => {
    setUser({ username: "", id: null });
    setJWT(undefined);
  };

  return { user, jwt, signIn, signOut };
};

export { Auth, authContext };
