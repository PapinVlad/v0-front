"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { isAuthenticated, getUserRole } from "../utils/auth"
import BadgeForm from "../components/BadgeForm"
import api from "../utils/api"

const EditBadge = () => {
  const [badge, setBadge] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const { id } = useParams()

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

    // Fetch badge data
    const fetchBadge = async () => {
      try {
        const response = await api.get(`/badges/${id}`)
        setBadge(response.data.badge)
      } catch (error) {
        console.error("Error fetching badge:", error)
        setError("Failed to load badge")
      } finally {
        setLoading(false)
      }
    }

    fetchBadge()
  }, [navigate, id])

  if (loading) {
    return (
      <div className="edit-badge-page">
        <h1>Edit Badge</h1>
        <div className="loading">Loading badge...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="edit-badge-page">
        <h1>Edit Badge</h1>
        <div className="error-message">{error}</div>
        <button onClick={() => navigate("/admin/badges")} className="secondary-button">
          Back to Badges
        </button>
      </div>
    )
  }

  return (
    <div className="edit-badge-page">
      <h1>Edit Badge</h1>
      <BadgeForm badge={badge} isEditing={true} />
    </div>
  )
}

export default EditBadge
