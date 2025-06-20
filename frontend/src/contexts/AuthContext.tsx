import React, { createContext, useContext, useEffect, useState } from "react";
import {
  AuthState,
  getAuthState,
  subscribeToAuthChanges,
  setAuthData,
  clearAuth,
} from "../utils/auth";
import { authAPI } from "../services/api";

interface AuthContextType extends AuthState {
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [authState, setAuthStateLocal] = useState(getAuthState());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(() => {
      setAuthStateLocal(getAuthState());
    });

    const verifyToken = async () => {
      const currentState = getAuthState();
      if (currentState.token) {
        try {
          const response = await authAPI.verify();
          if (!response.success) {
            clearAuth();
          }
        } catch {
          clearAuth();
        }
      }
      setLoading(false);
    };

    verifyToken();
    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password });
      if (response.success) {
        setAuthData(response.data.user, response.data.token);
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Erro de conexão",
      };
    }
  };

  const logout = () => {
    clearAuth();
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
