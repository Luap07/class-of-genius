import { createContext, useState, useEffect } from "react";

export const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [searchValue, setSearchValue] = useState("");

  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem("searchHistory");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  /* ================= SAVE SEARCH ================= */
  const saveSearch = (value) => {
    const trimmed = value?.trim();
    if (!trimmed) return;

    setHistory((prev) => {
      const updated = [
        trimmed,
        ...prev.filter((h) => h !== trimmed),
      ].slice(0, 10);

      localStorage.setItem("searchHistory", JSON.stringify(updated));
      return updated;
    });
  };

  /* ================= DELETE SINGLE ================= */
  const deleteSearchItem = (value) => {
    setHistory((prev) => {
      const updated = prev.filter((h) => h !== value);

      localStorage.setItem("searchHistory", JSON.stringify(updated));
      return updated;
    });
  };

  /* ================= CLEAR ALL ================= */
  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("searchHistory");
  };

  /* ================= SYNC ON STORAGE CHANGE (IMPORTANT) ================= */
  useEffect(() => {
    const sync = () => {
      try {
        const updated =
          JSON.parse(localStorage.getItem("searchHistory")) || [];
        setHistory(updated);
      } catch {}
    };

    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  return (
    <SearchContext.Provider
      value={{
        searchValue,
        setSearchValue,

        history,
        saveSearch,
        deleteSearchItem,
        clearHistory,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};