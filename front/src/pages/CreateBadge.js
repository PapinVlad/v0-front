"use client"

import { useNavigate } from "react-router-dom"
import { isAuthenticated, getUserRole } from "../utils/auth"
import BadgeForm from "../components/BadgeForm"
import { useEffect, useState } from "react"

const CreateBadge = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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

    setLoading(false)
  }, [navigate])

  if (loading) {
    return (
      <div className="create-badge-page">
        <h1>Создание нового значка</h1>
        <div className="loading">Загрузка...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="create-badge-page">
        <h1>Создание нового значка</h1>
        <div className="error-message">{error}</div>
        <button onClick={() => navigate("/admin/badges")} className="secondary-button">
          Вернуться к значкам
        </button>
      </div>
    )
  }

  return (
    <div className="create-badge-page">
      <h1>Создание нового значка</h1>
      <BadgeForm
        isEditing={false}
        badge={{
          name: "",
          category: "",
          description: "",
          difficultyLevel: 1,
          requirements: [],
          activities: [],
        }}
      />
    </div>
  )
}

export default CreateBadge
