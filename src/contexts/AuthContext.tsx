import React, { createContext, useContext, useState, useEffect } from "react";
import type { User } from "../types";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  token: string | null;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // const login = async (email: string, password: string): Promise<boolean> => {
  //   try {
  //     const response = await fetch("http://localhost:5000/api/auth/login", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ email, password }),
  //     });

  //     if (!response.ok) {
  //       console.error("Login failed:", response.status, response.statusText);
  //       return false;
  //     }

  //     const data = await response.json();
  //     setUser(data.user);
  //     setToken(data.token);
  //     localStorage.setItem("Sk_Leeno_token", data.token);
  //     localStorage.setItem("Sk_Leeno_user", JSON.stringify(data.user));
  //     return true;
  //   } catch (error) {
  //     console.error("An error occurred during login:", error);
  //     return false;
  //   }
  // };

  const API_BASE_URL =
    import.meta.env.MODE === "development"
      ? import.meta.env.VITE_LOCAL_URL || "http://localhost:5000"
      : import.meta.env.VITE_BACKEND_URL ||
        "https://carsalesbackend-production.up.railway.app";

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        console.error("Login failed:", response.status, response.statusText);
        return false;
      }

      const data = await response.json();
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem("Sk_Leeno_token", data.token);
      localStorage.setItem("Sk_Leeno_user", JSON.stringify(data.user));
      return true;
    } catch (error) {
      console.error("An error occurred during login:", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("Sk_Leeno_user");
    localStorage.removeItem("Sk_Leeno_token");
  };

  // Check for existing session on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("Sk_Leeno_user");
      const savedToken = localStorage.getItem("Sk_Leeno_token");

      if (savedUser && savedToken) {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      }
    } catch (error) {
      console.error("Failed to parse user data from localStorage", error);
      logout();
    }
    setLoading(false);
  }, []);

  const value = {
    user,
    login,
    logout,
    token,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
