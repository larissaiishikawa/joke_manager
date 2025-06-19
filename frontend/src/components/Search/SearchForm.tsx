import React, { useState } from "react";
import "./SearchForm.css";

export interface SearchFilters {
  category: string;
  keyword: string;
  author: string;
}

interface SearchFormProps {
  onSearch: (filters: SearchFilters) => void;
  isLoading: boolean;
}

const CATEGORIES = [
  { value: "", label: "Todas as categorias" },
  { value: "comedy", label: "Comédia" },
  { value: "puns", label: "Trocadilhos" },
  { value: "dad-jokes", label: "Piadas de Pai" },
  { value: "programming", label: "Programação" },
  { value: "dark-humor", label: "Humor Negro" },
  { value: "one-liner", label: "Uma Linha" },
];

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading }) => {
  const [filters, setFilters] = useState<SearchFilters>({
    category: "",
    keyword: "",
    author: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  const handleClear = () => {
    const clearedFilters = {
      category: "",
      keyword: "",
      author: "",
    };
    setFilters(clearedFilters);
    onSearch(clearedFilters);
  };

  return (
    <form onSubmit={handleSubmit} className="search-form">
      <div className="search-row">
        <div className="search-field">
          <input
            type="text"
            name="keyword"
            value={filters.keyword}
            onChange={handleInputChange}
            placeholder="Pesquisar piadas por palavra-chave..."
            className="search-input"
            disabled={isLoading}
          />
        </div>
        <button type="submit" className="search-btn" disabled={isLoading}>
          {isLoading ? "Pesquisando..." : "Pesquisar"}
        </button>
      </div>

      <div className="search-filters">
        <div className="filter-group">
          <label htmlFor="category">Categoria:</label>
          <select
            id="category"
            name="category"
            value={filters.category}
            onChange={handleInputChange}
            className="filter-select"
            disabled={isLoading}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="author">Autor:</label>
          <input
            type="text"
            id="author"
            name="author"
            value={filters.author}
            onChange={handleInputChange}
            placeholder="Nome do autor..."
            className="filter-input"
            disabled={isLoading}
          />
        </div>

        <button
          type="button"
          onClick={handleClear}
          className="clear-btn"
          disabled={isLoading}
        >
          Limpar
        </button>
      </div>

      <div className="search-tip">
        💡 <strong>Dica:</strong> Escolha o idioma inglês para obter melhores
        resultados. A API possui mais piadas disponíveis em inglês.
      </div>
    </form>
  );
};

export default SearchForm;
