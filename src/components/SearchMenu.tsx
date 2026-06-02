import React, { useRef, useState } from "react";
import { X } from "lucide-react";
import { CATEGORIES, FOODS, searchFoods } from "../data/foods";

const SearchMenu: React.FC = () => {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("default");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const executeSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) {
      searchInputRef.current?.focus();
      setSubmittedQuery("");
      return;
    }
    setSelectedCategory("All");
    setSubmittedQuery(query.trim());
  };

  const updateQuery = (value: string) => {
    setQuery(value);
    const nextQuery = value.trim();
    if (nextQuery) {
      setSelectedCategory("All");
    }
    setSubmittedQuery(nextQuery);
  };

  const clearSearch = () => {
    setQuery("");
    setSubmittedQuery("");
  };

  const searchResults = submittedQuery ? searchFoods(submittedQuery) : FOODS;
  const filteredResults = searchResults.filter(
    (food) => selectedCategory === "All" || food.category === selectedCategory,
  );

  const sortedResults = [...filteredResults].sort((a, b) => {
    if (sortBy === "priceAsc") return a.price - b.price;
    if (sortBy === "priceDesc") return b.price - a.price;
    return 0;
  });

  return (
    <div style={{ padding: "20px" }}>
      <form
        role="search"
        onSubmit={executeSearch}
        style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "20px", flexWrap: "wrap" }}
      >
        <div style={{ flex: "1 1 300px", maxWidth: "500px", display: "flex", gap: "8px" }}>
          <div style={{ position: "relative", width: "100%" }}>
            <input
              ref={searchInputRef}
              id="food-search"
              type="text"
              name="food-search"
              aria-label="Search food"
              aria-controls="food-search-results"
              placeholder="Search for delicious food..."
              value={query}
              onChange={(e) => updateQuery(e.target.value)}
              style={{ padding: "10px 35px 10px 10px", width: "100%", borderRadius: "5px", border: "1px solid #ccc", boxSizing: "border-box" }}
            />
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", cursor: "pointer", color: "#888", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
                aria-label="Clear search"
              >
                <X size={18} />
              </button>
            )}
          </div>
          <button
            type="submit"
            onClick={() => executeSearch()}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: "88px",
              height: "42px",
              padding: "0 16px",
              backgroundColor: "#ff9800",
              color: "#111",
              border: "1px solid #f4b24d",
              borderRadius: "10px",
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
              flexShrink: 0,
              fontWeight: 700,
              fontSize: "1rem",
              userSelect: "none",
            }}
            aria-label="Search food"
            aria-controls="food-search-results"
            title="Search food"
          >
            Search
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <strong style={{ color: "#333" }}>Sort By:</strong>
          <select
            aria-label="Sort food results"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc", outline: "none", cursor: "pointer" }}
          >
            <option value="default">Relevance</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
          </select>
        </div>
      </form>

      <div aria-live="polite" style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0, 0, 0, 0)" }}>
        {submittedQuery ? `${sortedResults.length} results for ${submittedQuery}` : `${sortedResults.length} foods shown`}
      </div>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "20px" }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            aria-pressed={selectedCategory === cat}
            aria-label={`Show ${cat} foods`}
            style={{
              padding: "8px 16px",
              borderRadius: "20px",
              border: "none",
              cursor: "pointer",
              backgroundColor: selectedCategory === cat ? "#27ae60" : "#eee",
              color: selectedCategory === cat ? "#fff" : "#333",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <div id="food-search-results" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "20px" }}>
        {sortedResults.length === 0 && (
          <p style={{ color: "#777", gridColumn: "1 / -1", textAlign: "center" }}>
            No items found for "{submittedQuery}".
          </p>
        )}
        {sortedResults.map((food) => (
          <div key={food.id} style={{ border: "1px solid #ddd", padding: "15px", borderRadius: "10px", backgroundColor: "#fff" }}>
            <h3 style={{ margin: "0 0 10px 0" }}>{food.emoji} {food.name}</h3>
            <p style={{ margin: "0 0 10px 0", color: "#555" }}>{food.desc}</p>
            <strong style={{ color: "#27ae60", fontSize: "1.2rem" }}>Rs. {food.price}</strong>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchMenu;
