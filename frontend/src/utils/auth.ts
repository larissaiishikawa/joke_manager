import { setAuthToken } from "../services/api";

export interface User {
  id: string;
  username: string;
  email: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

const initializeAuthState = (): AuthState => {
  const savedToken = localStorage.getItem("auth_token");
  const savedUser = localStorage.getItem("auth_user");

  if (savedToken && savedUser) {
    try {
      const user = JSON.parse(savedUser);
      setAuthToken(savedToken);
      return {
        user,
        token: savedToken,
        isAuthenticated: true,
      };
    } catch {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
    }
  }

  return {
    user: null,
    token: null,
    isAuthenticated: false,
  };
};

let authState: AuthState = initializeAuthState();

const listeners: (() => void)[] = [];

const notifyListeners = () => {
  listeners.forEach((listener) => listener());
};

export const subscribeToAuthChanges = (listener: () => void) => {
  listeners.push(listener);
  return () => {
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
};

export const getAuthState = (): AuthState => {
  return { ...authState };
};

export const setAuthData = (user: User | null, token: string | null) => {
  authState = {
    user,
    token,
    isAuthenticated: !!(user && token),
  };

  if (user && token) {
    localStorage.setItem("auth_token", token);
    localStorage.setItem("auth_user", JSON.stringify(user));
  } else {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
  }

  setAuthToken(token);
  notifyListeners();
};

export const clearAuth = () => {
  setAuthData(null, null);
};

export const isAuthenticated = (): boolean => {
  return authState.isAuthenticated;
};

export const getCurrentUser = (): User | null => {
  return authState.user;
};
