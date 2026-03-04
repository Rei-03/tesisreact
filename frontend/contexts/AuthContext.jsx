"use client";
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Verificar si hay una sesión guardada en localStorage
    const authStatus = localStorage.getItem("isAuthenticated");
    const userData = localStorage.getItem("userData");
    
    if (authStatus === "true") {
      setIsAuthenticated(true);
      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (e) {
          console.error("Error parsing user data:", e);
        }
      }
    } else {
      // MODO DEMO: Si no hay usuario, crear un admin automáticamente
      const demoUser = {
        id: 1,
        nombre: "Brayan Castellano",
        login: "bcastellano",
        rol: "admin",
      };
      setIsAuthenticated(true);
      setUser(demoUser);
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userData", JSON.stringify(demoUser));
    }
    setIsLoading(false);
  }, []);

  const login = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("userData", JSON.stringify(userData));
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userData");
  };

  const isAdmin = () => {
    return user?.rol === "admin" || user?.role === "admin";
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout, user, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

