import React from "react";
import "./JokeCard.css";

export interface Joke {
  _id: string;
  title: string;
  content: string;
  category: string;
  author: string;
  createdBy: {
    _id: string;
    username: string;
  };
  views: number;
  likes: number;
  createdAt: string;
}

interface JokeCardProps {
  joke: Joke;
  onClick?: (joke: Joke) => void;
}

const JokeCard: React.FC<JokeCardProps> = ({ joke, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick(joke);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      comedy: "#ef4444",
      puns: "#8b5cf6",
      "dad-jokes": "#06b6d4",
      programming: "#10b981",
      "dark-humor": "#6b7280",
      "one-liner": "#f59e0b",
    };
    return colors[category] || "#6b7280";
  };

  return (
    <div
      className={`joke-card ${onClick ? "clickable" : ""}`}
      onClick={handleClick}
    >
      <div className="joke-header">
        <h3 className="joke-title">{joke.title}</h3>
        <span
          className="joke-category"
          style={{ backgroundColor: getCategoryColor(joke.category) }}
        >
          {joke.category}
        </span>
      </div>

      <p className="joke-content">{joke.content}</p>

      <div className="joke-footer">
        <div className="joke-author">
          Por: <strong>{joke.author}</strong>
        </div>
        <div className="joke-meta">
          <span className="joke-stats">
            👀 {joke.views} • ❤️ {joke.likes}
          </span>
          <span className="joke-date">{formatDate(joke.createdAt)}</span>
        </div>
      </div>

      <div className="joke-user">Adicionada por: {joke.createdBy.username}</div>
    </div>
  );
};

export default JokeCard;
