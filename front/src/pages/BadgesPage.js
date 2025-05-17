"use client"

import { useState, useEffect } from "react"
import api from "../utils/api"
import BadgeList from "../components/BadgeList"
import BadgeDetail from "../components/BadgeDetail"
import BadgeFilter from "../components/BadgeFilter"

const BadgesPage = () => {
  const [badges, setBadges] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedBadge, setSelectedBadge] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedDifficulty, setSelectedDifficulty] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [badgesResponse, categoriesResponse] = await Promise.all([
          api.get("/badges"),
          api.get("/badges/categories"),
        ])

        setBadges(badgesResponse.data.badges)
        setCategories(categoriesResponse.data.categories)
      } catch (error) {
        console.error("Error fetching badges:", error)
        setError("Failed to load badges. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleBadgeSelect = async (badgeId) => {
    try {
      setLoading(true)
      const response = await api.get(`/badges/${badgeId}`)
      setSelectedBadge(response.data.badge)
    } catch (error) {
      console.error("Error fetching badge details:", error)
      setError("Failed to load badge details. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const handleBackToList = () => {
    setSelectedBadge(null)
  }

  const handleSearch = (term) => {
    setSearchTerm(term)
  }

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category)
  }

  const handleDifficultyFilter = (difficulty) => {
    setSelectedDifficulty(difficulty)
  }

  const filteredBadges = badges.filter((badge) => {
    const matchesSearch =
      badge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      badge.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "" || badge.category === selectedCategory
    const matchesDifficulty = selectedDifficulty === "" || badge.difficultyLevel.toString() === selectedDifficulty

    return matchesSearch && matchesCategory && matchesDifficulty
  })

  if (error) {
    return (
      <div className="badges-page">
        <h1>Cub Scout Badges</h1>
        <div className="error-message">{error}</div>
      </div>
    )
  }

  return (
    <div className="badges-page">
      <h1>Cub Scout Badges</h1>

      {selectedBadge ? (
        <BadgeDetail badge={selectedBadge} onBack={handleBackToList} />
      ) : (
        <>
          <p className="badges-intro">
            Explore all the badges that Cub Scouts can earn. Each badge represents skills and knowledge in different
            areas. Click on a badge to learn more about its requirements and activities.
          </p>

          <BadgeFilter
            categories={categories}
            onSearch={handleSearch}
            onCategoryChange={handleCategoryFilter}
            onDifficultyChange={handleDifficultyFilter}
          />

          {loading ? (
            <div className="loading">Loading badges...</div>
          ) : (
            <BadgeList badges={filteredBadges} onBadgeSelect={handleBadgeSelect} />
          )}
        </>
      )}
    </div>
  )
}

export default BadgesPage
