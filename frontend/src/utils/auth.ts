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

let authState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
};

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
