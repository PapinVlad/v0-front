"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { isAuthenticated, getUserRole } from "../utils/auth"
import api from "../utils/api"

const BadgeManagement = () => {
  const [badges, setBadges] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [categories, setCategories] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is authenticated and has admin role
    if (!isAuthenticated()) {
      navigate("/login")
      return
    }

    const userRole = getUserRole()
    if (userRole !== "admin" && userRole !== "leader") {
      navigate("/")
      return
    }

    // Fetch badges and categories
    const fetchData = async () => {
      try {
        const [badgesResponse, categoriesResponse] = await Promise.all([
          api.get("/badges"),
          api.get("/badges/categories"),
        ])

        console.log("Badges response:", badgesResponse.data)

        // Проверяем, что данные имеют правильную структуру
        if (badgesResponse.data && badgesResponse.data.badges) {
          setBadges(badgesResponse.data.badges)
        } else {
          console.error("Unexpected badges response format:", badgesResponse.data)
          setBadges([])
          setError("Неверный формат данных значков")
        }

        if (categoriesResponse.data && categoriesResponse.data.categories) {
          setCategories(categoriesResponse.data.categories)
        } else {
          console.error("Unexpected categories response format:", categoriesResponse.data)
          setCategories([])
        }
      } catch (error) {
        console.error("Error fetching badges:", error)
        setBadges([]) // Устанавливаем пустой массив вместо undefined
        setError("Не удалось загрузить значки")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [navigate])

  const handleDelete = async (badgeId) => {
    if (!window.confirm("Вы уверены, что хотите удалить этот значок?")) {
      return
    }

    try {
      await api.delete(`/badges/${badgeId}`)
      setBadges(badges.filter((badge) => badge.id !== badgeId))
    } catch (error) {
      console.error("Error deleting badge:", error)
      setError("Не удалось удалить значок")
    }
  }

  const filteredBadges =
    badges && badges.length > 0
      ? badges.filter((badge) => {
          const matchesSearch =
            badge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            badge.description.toLowerCase().includes(searchTerm.toLowerCase())
          const matchesCategory = selectedCategory === "" || badge.category === selectedCategory

          return matchesSearch && matchesCategory
        })
      : []

  if (loading) {
    return (
      <div className="badge-management">
        <h1>Управление значками</h1>
        <div className="loading">Загрузка значков...</div>
      </div>
    )
  }

  return (
    <div className="badge-management">
      <h1>Управление значками</h1>

      <div className="management-actions">
        <button onClick={() => navigate("/admin/badges/new")} className="primary-button">
          Создать новый значок
        </button>
        <button onClick={() => navigate("/admin")} className="secondary-button">
          Вернуться в панель управления
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="filter-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Поиск значков..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="category-filter">
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            <option value="">Все категории</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredBadges.length === 0 ? (
        <div className="no-results">Нет значков, соответствующих вашим критериям</div>
      ) : (
        <div className="badges-grid">
          {filteredBadges.map((badge) => (
            <div key={badge.id} className="badge-card">
              <div className="badge-image">
                {badge.imageUrl ? (
                  <img
                    src={`http://localhost:5000${badge.imageUrl}`}
                    alt={badge.name}
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src = "/placeholder-badge.png"
                    }}
                  />
                ) : (
                  <div className="no-image">Нет изображения</div>
                )}
              </div>
              <div className="badge-info">
                <h3>{badge.name}</h3>
                <span className="badge-category">{badge.category}</span>
                <div className="badge-difficulty">Сложность: {Array(badge.difficultyLevel).fill("★").join("")}</div>
                <p className="badge-description">{badge.description}</p>
              </div>
              <div className="badge-actions">
                <button onClick={() => navigate(`/admin/badges/edit/${badge.id}`)} className="edit-button">
                  Редактировать
                </button>
                <button onClick={() => handleDelete(badge.id)} className="delete-button">
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default BadgeManagement
