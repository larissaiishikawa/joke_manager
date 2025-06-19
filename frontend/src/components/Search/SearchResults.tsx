import React from 'react';
import JokeCard, { Joke } from '../JokeCard/JokeCard';
import './SearchResults.css';

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalJokes: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface SearchResultsProps {
  jokes: Joke[];
  pagination: PaginationInfo;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onJokeClick?: (joke: Joke) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  jokes,
  pagination,
  isLoading,
  onPageChange,
  onJokeClick,
}) => {
  if (isLoading) {
    return (
      <div className="search-results">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Buscando piadas...</p>
        </div>
      </div>
    );
  }

  if (jokes.length === 0) {
    return (
      <div className="search-results">
        <div className="no-results">
          <div className="no-results-icon">😅</div>
          <h3>Nenhuma piada encontrada</h3>
          <p>Tente ajustar os filtros de busca ou pesquisar por outras palavras-chave.</p>
        </div>
      </div>
    );
  }

  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    const currentPage = pagination.currentPage;
    const totalPages = pagination.totalPages;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      pages.push(
        <button key={1} onClick={() => onPageChange(1)} className="page-btn">
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(<span key="start-ellipsis" className="page-ellipsis">...</span>);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`page-btn ${i === currentPage ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="end-ellipsis" className="page-ellipsis">...</span>);
      }
      pages.push(
        <button key={totalPages} onClick={() => onPageChange(totalPages)} className="page-btn">
          {totalPages}
        </button>
      );
    }

    return (
      <div className="pagination">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!pagination.hasPreviousPage}
          className="page-btn nav-btn"
        >
          ← Anterior
        </button>
        
        <div className="page-numbers">
          {pages}
        </div>
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!pagination.hasNextPage}
          className="page-btn nav-btn"
        >
          Próxima →
        </button>
      </div>
    );
  };

  return (
    <div className="search-results">
      <div className="results-header">
        <h2>Encontre Piadas</h2>
        <p className="results-count">
          {pagination.totalJokes} piada{pagination.totalJokes !== 1 ? 's' : ''} encontrada{pagination.totalJokes !== 1 ? 's' : ''}
          {pagination.totalPages > 1 && (
            <> • Página {pagination.currentPage} de {pagination.totalPages}</>
          )}
        </p>
      </div>

      <div className="joke-grid">
        {jokes.map(joke => (
          <JokeCard
            key={joke._id}
            joke={joke}
            onClick={onJokeClick}
          />
        ))}
      </div>

      {renderPagination()}
    </div>
  );
};

export default SearchResults;
