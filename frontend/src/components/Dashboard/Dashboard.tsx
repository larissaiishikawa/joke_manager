import React, { useState, useEffect, useCallback } from "react";
import SearchForm, { SearchFilters } from "../Search/SearchForm";
import SearchResults, { PaginationInfo } from "../Search/SearchResults";
import JokeForm from "../JokeForm/JokeForm";
import { Joke } from "../JokeCard/JokeCard";
import { jokesAPI } from "../../services/api";
import "./Dashboard.css";

const Dashboard: React.FC = () => {
  const [jokes, setJokes] = useState<Joke[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalJokes: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<SearchFilters>({
    category: "",
    keyword: "",
    author: "",
  });
  const [activeTab, setActiveTab] = useState<"search" | "add">("search");

  const fetchJokes = useCallback(
    async (filters: SearchFilters, page: number = 1) => {
      setIsLoading(true);
      try {
        const params: any = {
          page,
          limit: 10,
        };

        if (filters.category) params.category = filters.category;
        if (filters.keyword) params.keyword = filters.keyword;
        if (filters.author) params.author = filters.author;

        const hasFilters =
          filters.category || filters.keyword || filters.author;

        const response = hasFilters
          ? await jokesAPI.search(params)
          : await jokesAPI.getAll(params);

        if (response.success) {
          setJokes(response.data.jokes);
          setPagination(response.data.pagination);
        }
      } catch (error) {
        console.error("Error fetching jokes:", error);
        setJokes([]);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalJokes: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        });
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchJokes(currentFilters, 1);
  }, [fetchJokes, currentFilters]);

  const handleSearch = (filters: SearchFilters) => {
    setCurrentFilters(filters);
    fetchJokes(filters, 1);
  };

  const handlePageChange = (page: number) => {
    fetchJokes(currentFilters, page);
  };

  const handleJokeAdded = () => {
    setActiveTab("search");
    fetchJokes(currentFilters, 1);
  };

  const handleJokeClick = async (joke: Joke) => {
    try {
      await jokesAPI.getById(joke._id);
      console.log("Joke viewed:", joke.title);
    } catch (error) {
      console.error("Error viewing joke:", error);
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        <div className="dashboard-tabs">
          <button
            className={`tab-btn ${activeTab === "search" ? "active" : ""}`}
            onClick={() => setActiveTab("search")}
          >
            🔍 Buscar Piadas
          </button>
          <button
            className={`tab-btn ${activeTab === "add" ? "active" : ""}`}
            onClick={() => setActiveTab("add")}
          >
            ➕ Adicionar Piada
          </button>
        </div>

        <div className="tab-content">
          {activeTab === "search" && (
            <div className="search-tab">
              <SearchForm onSearch={handleSearch} isLoading={isLoading} />

              <SearchResults
                jokes={jokes}
                pagination={pagination}
                isLoading={isLoading}
                onPageChange={handlePageChange}
                onJokeClick={handleJokeClick}
              />
            </div>
          )}

          {activeTab === "add" && (
            <div className="add-tab">
              <JokeForm onSuccess={handleJokeAdded} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
