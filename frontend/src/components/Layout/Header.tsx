import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../../services/api";
import {
  clearAuth,
  getAuthState,
  getCurrentUser,
  subscribeToAuthChanges,
} from "../../utils/auth";
import "./Header.css";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(getCurrentUser());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(() => {
      setUser(getCurrentUser());
    });

    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await authAPI.logout();
      clearAuth();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      clearAuth();
      navigate("/login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleHomeClick = () => {
    navigate("/dashboard");
  };

  if (!getAuthState().isAuthenticated) {
    return null;
  }

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-brand" onClick={handleHomeClick}>
          <h1>O Piadista</h1>
          <p>Onde o humor é gratuito... e às vezes até engraçado</p>
        </div>

        <div className="header-user">
          <span className="user-welcome">Olá, {user?.username}!</span>
          <button
            onClick={handleLogout}
            disabled={isLoading}
            className="logout-btn"
          >
            {isLoading ? "Saindo..." : "Sair"}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
