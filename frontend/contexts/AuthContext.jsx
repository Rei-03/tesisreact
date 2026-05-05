"use client";
import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { getStoredUserData, validateSession, refreshAccessToken } from "@/lib/services/authService";

const AuthContext = createContext(null);

// El accessToken dura 15 min. Refrescamos 2 min antes del vencimiento.
const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000;
const REFRESH_BEFORE_MS = 2 * 60 * 1000;
const REFRESH_INTERVAL_MS = ACCESS_TOKEN_TTL_MS - REFRESH_BEFORE_MS; // 13 min

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const refreshTimerRef = useRef(null);

  /** Cancela el timer de refresco proactivo */
  const clearRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  /** Inicia un timer que refresca el accessToken silenciosamente cada 13 min */
  const startRefreshTimer = useCallback(() => {
    clearRefreshTimer();
    refreshTimerRef.current = setInterval(async () => {
      try {
        await refreshAccessToken();
      } catch {
        // Si el refresh falla (refresh token vencido), el interceptor de
        // apiClient redirigirá a login en el siguiente request protegido.
        clearRefreshTimer();
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem("userData");
      }
    }, REFRESH_INTERVAL_MS);
  }, [clearRefreshTimer]);

  useEffect(() => {
    const verifySession = async () => {
      try {
        const userData = await validateSession();
        if (userData) {
          setIsAuthenticated(true);
          setUser(userData);
          startRefreshTimer();
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.warn('Sesión inválida o expirada:', error.message);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();

    return () => clearRefreshTimer();
  }, [startRefreshTimer, clearRefreshTimer]);

  const login = useCallback((userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    localStorage.setItem("userData", JSON.stringify(userData));
    startRefreshTimer();
  }, [startRefreshTimer]);

  const logout = useCallback(() => {
    clearRefreshTimer();
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem("userData");
    localStorage.removeItem("token");
    localStorage.removeItem("isAuthenticated");
  }, [clearRefreshTimer]);

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

