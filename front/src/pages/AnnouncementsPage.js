"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { isAuthenticated, getUserRole } from "../utils/auth"
import api from "../utils/api"
/* import "../styles/announcements.css" */

const AnnouncementsPage = ({ isAdmin = false }) => {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [error, setError] = useState(null)
  const isAuth = isAuthenticated()
  const userRole = getUserRole()
  const canCreateAnnouncement = isAuth && (userRole === "admin" || userRole === "leader")

  useEffect(() => {
    fetchAnnouncements()
  }, [isAdmin])

  const fetchAnnouncements = async () => {
    try {
      setLoading(true)
      setError(null)

      // Определяем эндпоинт в зависимости от роли пользователя
      const endpoint = isAdmin ? "/announcements/admin/all" : "/announcements"

      console.log("Fetching announcements from:", endpoint)

      // Делаем реальный API-запрос
      const response = await api.get(endpoint)
      console.log("Announcements response:", response.data)

      if (response.data && response.data.success) {
        setAnnouncements(response.data.announcements || [])
      } else {
        setError("Failed to load announcements. Please try again later.")
      }

      setLoading(false)
    } catch (error) {
      console.error("Error fetching announcements:", error)
      setError(`Failed to load announcements: ${error.message || "Unknown error"}`)
      setLoading(false)

      // Если нет данных, используем пустой массив
      setAnnouncements([])
    }
  }

  const handleDeleteAnnouncement = async (announcementId) => {
    if (!window.confirm("Вы уверены, что хотите удалить это объявление?")) {
      return
    }

    try {
      const response = await api.delete(`/announcements/${announcementId}`)

      if (response.data && response.data.success) {
        // Обновляем список объявлений после успешного удаления
        setAnnouncements(announcements.filter((a) => a.announcement_id !== announcementId))
      } else {
        alert("Failed to delete announcement. Please try again later.")
      }
    } catch (error) {
      console.error("Error deleting announcement:", error)
      alert("Failed to delete announcement. Please try again later.")
    }
  }

  // Фильтрация объявлений на основе роли пользователя и выбранного фильтра
  const filteredAnnouncements = announcements.filter((announcement) => {
    // Для неавторизованных пользователей показываем только публичные объявления
    if (!isAuth && announcement.target_role !== "all") {
      return false
    }

    // Для авторизованных пользователей показываем объявления для их роли и публичные
    if (isAuth && announcement.target_role !== "all" && announcement.target_role !== userRole) {
      return false
    }

    // Применяем фильтр категории, если не выбрано 'all'
    if (filter !== "all" && announcement.category !== filter) {
      return false
    }

    return true
  })

  // Сортировка объявлений: сначала закрепленные, затем по дате
  const sortedAnnouncements = [...filteredAnnouncements].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1
    if (!a.is_pinned && b.is_pinned) return 1
    return new Date(b.created_at) - new Date(a.created_at)
  })

  if (loading) {
    return <div className="loading">Loading announcements...</div>
  }

  return (
    <div className="announcements-page">
      <div className="announcements-header">
        <h1>Announcements</h1>
        {canCreateAnnouncement && (
          <Link to="/admin/announcements/create" className="btn btn-primary create-button">
            Create Announcement
          </Link>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="announcements-controls">
        <div className="filter-controls">
          <label htmlFor="filter">Filter by: </label>
          <select id="filter" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Categories</option>
            <option value="events">Events</option>
            <option value="badges">Badges</option>
            <option value="training">Training</option>
            <option value="general">General</option>
          </select>
        </div>
      </div>

      <div className="announcements-list">
        {sortedAnnouncements.length === 0 ? (
          <p>No announcements available</p>
        ) : (
          sortedAnnouncements.map((announcement) => (
            <div
              key={announcement.announcement_id || announcement.id}
              className={`announcement ${announcement.is_pinned ? "pinned" : ""}`}
            >
              <div className="announcement-header">
                <h2 className="announcement-title">
                  {announcement.is_pinned && <span className="pin-icon">📌</span>}
                  {announcement.title}
                </h2>
                <span className="announcement-date">
                  {new Date(announcement.created_at || announcement.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="announcement-content">{announcement.content}</div>

              <div className="announcement-footer">
                <span className="announcement-category">Category: {announcement.category || "General"}</span>
                <span className="announcement-author">
                  Posted by: {announcement.creator_name || announcement.createdBy?.name || "Unknown"}
                </span>
              </div>

              {canCreateAnnouncement && (
                <div className="announcement-admin-actions">
                  <Link
                    to={`/admin/announcements/edit/${announcement.announcement_id || announcement.id}`}
                    className="btn btn-sm btn-secondary"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDeleteAnnouncement(announcement.announcement_id || announcement.id)}
                    className="btn btn-sm btn-danger"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default AnnouncementsPage
