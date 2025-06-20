import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useRef,
} from "react";

export interface SearchFilters {
  category: string;
  keyword: string;
  author: string;
  page: number;
  limit: number;
}

export interface Joke {
  _id: string;
  title: string;
  content: string;
  category: string;
  author: string;
  views: number;
  likes: number;
  createdAt: string;
  createdBy: {
    username: string;
  };
}

interface SearchResult {
  jokes: Joke[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalJokes: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

interface SearchState {
  results: SearchResult | null;
  isLoading: boolean;
  error: string | null;
  filters: SearchFilters;
  cache: Map<string, { data: SearchResult; timestamp: number }>;
}

type SearchAction =
  | { type: "SEARCH_START" }
  | { type: "SEARCH_SUCCESS"; payload: SearchResult }
  | { type: "SEARCH_ERROR"; payload: string }
  | { type: "SET_FILTERS"; payload: Partial<SearchFilters> }
  | { type: "CLEAR_RESULTS" };

const initialState: SearchState = {
  results: null,
  isLoading: false,
  error: null,
  filters: {
    category: "",
    keyword: "",
    author: "",
    page: 1,
    limit: 10,
  },
  cache: new Map(),
};

const searchReducer = (
  state: SearchState,
  action: SearchAction
): SearchState => {
  switch (action.type) {
    case "SEARCH_START":
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case "SEARCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        results: action.payload,
        error: null,
      };

    case "SEARCH_ERROR":
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    case "SET_FILTERS":
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload,
          page: action.payload.page || 1,
        },
      };

    case "CLEAR_RESULTS":
      return {
        ...state,
        results: null,
        error: null,
      };

    default:
      return state;
  }
};

// Context
interface SearchContextType {
  state: SearchState;
  searchJokes: (filters?: Partial<SearchFilters>) => Promise<void>;
  setFilters: (filters: Partial<SearchFilters>) => void;
  clearResults: () => void;
  isSearching: boolean;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

const getCacheKey = (filters: SearchFilters): string => {
  return JSON.stringify(filters);
};

const getCachedResult = (
  cache: Map<string, { data: SearchResult; timestamp: number }>,
  filters: SearchFilters
): SearchResult | null => {
  const key = getCacheKey(filters);
  const cached = cache.get(key);

  if (cached) {
    const isValid = Date.now() - cached.timestamp < 30 * 1000;
    if (isValid) {
      return cached.data;
    } else {
      cache.delete(key);
    }
  }

  return null;
};

const setCachedResult = (
  cache: Map<string, { data: SearchResult; timestamp: number }>,
  filters: SearchFilters,
  data: SearchResult
) => {
  const key = getCacheKey(filters);
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
};

interface SearchProviderProps {
  children: React.ReactNode;
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(searchReducer, initialState);
  const debounceTimerRef = useRef<number | undefined>(undefined);
  const abortControllerRef = useRef<AbortController | undefined>(undefined);

  const performSearch = useCallback(
    async (filters: SearchFilters) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const cachedResult = getCachedResult(state.cache, filters);
      if (cachedResult) {
        dispatch({ type: "SEARCH_SUCCESS", payload: cachedResult });
        return;
      }

      abortControllerRef.current = new AbortController();

      try {
        dispatch({ type: "SEARCH_START" });

        const params = new URLSearchParams();
        if (filters.category) params.append("category", filters.category);
        if (filters.keyword) params.append("keyword", filters.keyword);
        if (filters.author) params.append("author", filters.author);
        params.append("page", filters.page.toString());
        params.append("limit", filters.limit.toString());

        const API_URL = "http://localhost:3000/api";
        const response = await fetch(
          `${API_URL}/jokes/search?${params.toString()}`,
          {
            signal: abortControllerRef.current.signal,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Erro na busca");
        }

        const data = await response.json();
        const result = data.data;

        setCachedResult(state.cache, filters, result);

        dispatch({ type: "SEARCH_SUCCESS", payload: result });
      } catch (error: any) {
        if (error.name !== "AbortError") {
          console.error("Search error:", error);
          dispatch({
            type: "SEARCH_ERROR",
            payload: error.message || "Erro na busca",
          });
        }
      }
    },
    [state.cache]
  );

  const searchJokes = useCallback(
    async (newFilters?: Partial<SearchFilters>) => {
      const filters = { ...state.filters, ...newFilters };

      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
      }

      if (!filters.keyword.trim() && !filters.category && !filters.author) {
        dispatch({ type: "CLEAR_RESULTS" });
        return;
      }

      debounceTimerRef.current = window.setTimeout(() => {
        performSearch(filters);
      }, 150);
    },
    [state.filters, performSearch]
  );

  const setFilters = useCallback(
    (newFilters: Partial<SearchFilters>) => {
      dispatch({ type: "SET_FILTERS", payload: newFilters });
      searchJokes(newFilters);
    },
    [searchJokes]
  );

  const clearResults = useCallback(() => {
    dispatch({ type: "CLEAR_RESULTS" });
    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const value: SearchContextType = {
    state,
    searchJokes,
    setFilters,
    clearResults,
    isSearching: state.isLoading,
  };

  return React.createElement(SearchContext.Provider, { value }, children);
};

export const useSearch = (): SearchContextType => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
};
