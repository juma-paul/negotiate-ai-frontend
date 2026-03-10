"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { User, AuthResponse, LoginRequest, RegisterRequest } from "@/types/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (credentials: RegisterRequest) => Promise<void>;
  logout: () => void;
  updatePreferences: (prefs: Partial<User["preferences"]>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // Verify token on mount
  useEffect(() => {
    if (token) {
      fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Invalid token");
          return res.json();
        })
        .then((data) => {
          setUser({
            id: data.id,
            email: data.email,
            preferences: data.preferences || {},
          });
        })
        .catch(() => {
          // Token invalid, clear auth state
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setToken(null);
          setUser(null);
        });
    }
  }, [token]);

  const login = useCallback(async (credentials: LoginRequest) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Login failed" }));
      throw new Error(error.detail || "Invalid email or password");
    }

    const data: AuthResponse = await response.json();

    localStorage.setItem("token", data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));

    setToken(data.access_token);
    setUser(data.user);
  }, []);

  const register = useCallback(async (credentials: RegisterRequest) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Registration failed" }));
      throw new Error(error.detail || "Registration failed");
    }

    const data: AuthResponse = await response.json();

    localStorage.setItem("token", data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));

    setToken(data.access_token);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }, []);

  const updatePreferences = useCallback(async (prefs: Partial<User["preferences"]>) => {
    if (!token) throw new Error("Not authenticated");

    const response = await fetch(`${API_URL}/auth/preferences`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(prefs),
    });

    if (!response.ok) {
      throw new Error("Failed to update preferences");
    }

    const data = await response.json();

    if (user) {
      const updatedUser = { ...user, preferences: data.preferences };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  }, [token, user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updatePreferences,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Helper to get auth header for API calls
export function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}
