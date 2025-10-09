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

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
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

      const data = await response.json(); // Assuming the API returns { token: string, user: User }
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem("jk_autos_token", data.token);
      localStorage.setItem("jk_autos_user", JSON.stringify(data.user));
      return true;
    } catch (error) {
      console.error("An error occurred during login:", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("jk_autos_user");
    localStorage.removeItem("jk_autos_token");
  };

  // Check for existing session on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("jk_autos_user");
      const savedToken = localStorage.getItem("jk_autos_token");

      if (savedUser && savedToken) {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      }
    } catch (error) {
      console.error("Failed to parse user data from localStorage", error);
      logout(); // Clear corrupted data
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
