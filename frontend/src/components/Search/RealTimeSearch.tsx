import React, { useEffect } from "react";
import { useSearch } from "../../contexts/SearchContext";
import "./RealTimeSearch.css";

const CATEGORIES = [
  { value: "", label: "Todas as categorias" },
  { value: "comedy", label: "Comédia" },
  { value: "puns", label: "Trocadilhos" },
  { value: "dad-jokes", label: "Piadas de Pai" },
  { value: "programming", label: "Programação" },
  { value: "dark-humor", label: "Humor Negro" },
  { value: "one-liner", label: "Uma Linha" },
];

const RealTimeSearch: React.FC = () => {
  const { state, setFilters, clearResults, isSearching } = useSearch();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters({ [name]: value });
  };

  const handleClear = () => {
    setFilters({
      category: "",
      keyword: "",
      author: "",
      page: 1,
    });
    clearResults();
  };

  const handleJokeLike = async (jokeId: string) => {
    console.log("Like joke:", jokeId);
  };

  return (
    <div className="real-time-search">
      <div className="search-header">
        <h2>🔍 Busca em Tempo Real</h2>
        <p>Digite para buscar automaticamente</p>
      </div>

      <div className="search-form">
        <div className="search-row">
          <div className="search-field">
            <label htmlFor="keyword">Palavra-chave:</label>
            <input
              type="text"
              id="keyword"
              name="keyword"
              value={state.filters.keyword}
              onChange={handleInputChange}
              placeholder="Digite aqui..."
              className="search-input"
            />
          </div>

          <div className="search-field">
            <label htmlFor="category">Categoria:</label>
            <select
              id="category"
              name="category"
              value={state.filters.category}
              onChange={handleInputChange}
              className="search-select"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="search-field">
            <label htmlFor="author">Autor:</label>
            <input
              type="text"
              id="author"
              name="author"
              value={state.filters.author}
              onChange={handleInputChange}
              placeholder="Nome do autor"
              className="search-input"
            />
          </div>

          <button type="button" onClick={handleClear} className="clear-button">
            Limpar
          </button>
        </div>
      </div>

      <div className="search-status">
        {isSearching && (
          <div className="loading-indicator">
            <span>🔄 Buscando...</span>
          </div>
        )}

        {state.error && (
          <div className="error-message">
            <span>❌ {state.error}</span>
          </div>
        )}

        {state.results && !isSearching && (
          <div className="results-summary">
            <span>
              ✅ {state.results.pagination.totalJokes} piadas encontradas
              {state.filters.keyword && ` para "${state.filters.keyword}"`}
            </span>
          </div>
        )}
      </div>

      {state.results && state.results.jokes.length > 0 && (
        <div className="search-results">
          <div className="results-grid">
            {state.results.jokes.map((joke) => (
              <div key={joke._id} className="joke-card">
                <div className="joke-header">
                  <h3 className="joke-title">{joke.title}</h3>
                  <span className="joke-category">{joke.category}</span>
                </div>
                <p className="joke-content">{joke.content}</p>
                <div className="joke-footer">
                  <span className="joke-author">Por: {joke.author}</span>
                  <div className="joke-stats">
                    <span className="joke-views">👀 {joke.views}</span>
                    <button
                      className="like-button"
                      onClick={() => handleJokeLike(joke._id)}
                    >
                      ❤️ {joke.likes || 0}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {state.results.pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                disabled={!state.results.pagination.hasPreviousPage}
                onClick={() => setFilters({ page: state.filters.page - 1 })}
                className="pagination-button"
              >
                ← Anterior
              </button>

              <span className="pagination-info">
                Página {state.results.pagination.currentPage} de{" "}
                {state.results.pagination.totalPages}
              </span>

              <button
                disabled={!state.results.pagination.hasNextPage}
                onClick={() => setFilters({ page: state.filters.page + 1 })}
                className="pagination-button"
              >
                Próxima →
              </button>
            </div>
          )}
        </div>
      )}

      {state.results && state.results.jokes.length === 0 && !isSearching && (
        <div className="no-results">
          <p>😔 Nenhuma piada encontrada</p>
          <p>Tente buscar com outras palavras-chave</p>
        </div>
      )}
    </div>
  );
};

export default RealTimeSearch;
