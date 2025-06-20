import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { authAPI } from "../../services/api";
import "./Header.css";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      logout();
      navigate("/login");
      setIsLoading(false);
    }
  };

  const handleHomeClick = () => {
    navigate("/dashboard");
  };

  if (!isAuthenticated) {
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
