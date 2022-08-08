import { min } from "moment";
import { createContext, FC, ReactNode, useState } from "react";
import { Auth } from "../@types/auth";
import { User } from "../@types/user";

export const AuthContext = createContext<Auth | null >(null);

const AuthProvider: FC<ReactNode> = ({children} : {children: ReactNode}) => {
    const [user, setUser] = useState<User>(null);
    const [token, setToken] = useState<Auth['token']>(null);
    const [loggedIn, setLoggedIn] = useState<Auth['loggedIn']>(false)
    const login = ({user, token} : {user: User; token: Auth['token']}) => {
        setUser(user);
        setToken(token)
        setLoggedIn(true)
    }

    const logout = () => {
        setUser(null);
        setToken(null)
        setLoggedIn(false)
    }

    const authObject = {
        loggedIn,
        token,
        user,
        login,
        logout
    }
    return (
        <AuthContext.Provider value={authObject}>
            {children}
        </AuthContext.Provider>
    )
}



export default AuthProvider;