"use client"

import { useState } from "react"

const BadgeFilter = ({ categories, onSearch, onCategoryChange, onDifficultyChange }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedDifficulty, setSelectedDifficulty] = useState("")

  const handleSearchChange = (e) => {
    const term = e.target.value
    setSearchTerm(term)
    onSearch(term)
  }

  const handleCategoryChange = (e) => {
    const category = e.target.value
    setSelectedCategory(category)
    onCategoryChange(category)
  }

  const handleDifficultyChange = (e) => {
    const difficulty = e.target.value
    setSelectedDifficulty(difficulty)
    onDifficultyChange(difficulty)
  }

  const handleClearFilters = () => {
    setSearchTerm("")
    setSelectedCategory("")
    setSelectedDifficulty("")
    onSearch("")
    onCategoryChange("")
    onDifficultyChange("")
  }

  return (
    <div className="badge-filter">
      <div className="filter-row">
        <div className="search-box">
          <input type="text" placeholder="Search badges..." value={searchTerm} onChange={handleSearchChange} />
        </div>

        <div className="filter-selects">
          <select value={selectedCategory} onChange={handleCategoryChange}>
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select value={selectedDifficulty} onChange={handleDifficultyChange}>
            <option value="">All Difficulties</option>
            <option value="1">★ Very Easy</option>
            <option value="2">★★ Easy</option>
            <option value="3">★★★ Moderate</option>
            <option value="4">★★★★ Challenging</option>
            <option value="5">★★★★★ Very Challenging</option>
          </select>

          <button onClick={handleClearFilters} className="clear-filters">
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  )
}

export default BadgeFilter
