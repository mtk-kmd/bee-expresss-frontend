import { createContext, useState, useContext, useEffect } from "react";
import Cookies from "js-cookie";

// Create Context
const AuthContext = createContext();

// Custom Hook to Use AuthContext
export const useAuth = () => useContext(AuthContext);

// AuthProvider Component
export const AuthProvider = ({ children }) => {
    const [authToken, setAuthToken] = useState(null);

    // Load token from cookies on initial load
    useEffect(() => {
        const token = Cookies.get("authToken");
        if (token) setAuthToken(token);
    }, []);

    const login = (token) => {
        setAuthToken(token);
        Cookies.set("authToken", token, { expires: 7 });
    };

    const logout = () => {
        setAuthToken(null);
        Cookies.remove("authToken");
    };

    const getUserDetails = () => {
        if (!authToken) return null;

        try {
          const user = JSON.parse(atob(authToken.split(".")[1]));
          return user;
        } catch (error) {
          console.error("Error parsing token:", error);
          return null;
        }
    };

    return (
        <AuthContext.Provider value={{ authToken, login, logout, getUserDetails }}>
        {children}
        </AuthContext.Provider>
    );
};
