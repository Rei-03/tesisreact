"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getStoredUserData, validateSession } from "@/lib/services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Verificar sesión: primero intenta validar con el backend
    const verifySession = async () => {
      try {
        // Intentar validar con el backend (verifica que el token en cookies sea válido)
        const userData = await validateSession();
        
        if (userData) {
          setIsAuthenticated(true);
          setUser(userData);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.warn('Sesión inválida o expirada:', error.message);
        
        // Si falla, limpiar datos locales
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();
  }, []);

  const login = useCallback((userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    // Solo guardar info del usuario, los tokens están en cookies httpOnly del servidor
    localStorage.setItem("userData", JSON.stringify(userData));
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setUser(null);
    // Limpiar localStorage (cookies se limpian en el servidor)
    localStorage.removeItem("userData");
    localStorage.removeItem("token"); // Fallback antiguo
    localStorage.removeItem("isAuthenticated");
  }, []);

  // Memoizar isAdmin para evitar que se cree una nueva función en cada render
  const isAdmin = useCallback(() => {
    return user?.rol === "admin" || user?.role === "admin";
  }, [user]);

  return (
    <AuthContext.Provider 
      value={{ 
        isAuthenticated, 
        isLoading, 
        login, 
        logout, 
        user, 
        isAdmin 
      }}
    >
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

