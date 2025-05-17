"use client"

import { useState, useEffect } from "react"
import api from "../../utils/api"
import "./Announcements.css"

const AnnouncementList = () => {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true)
        const response = await api.get("/announcements")

        if (response.data && response.data.success) {
          setAnnouncements(response.data.announcements)
        } else {
          setError("Failed to load announcements. Please try again later.")
        }

        setLoading(false)
      } catch (error) {
        console.error("Error fetching announcements:", error)
        setError("Failed to load announcements. Please try again later.")
        setLoading(false)
      }
    }

    fetchAnnouncements()
  }, [])

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  const getPriorityClass = (priority) => {
    switch (priority) {
      case "urgent":
        return "priority-urgent"
      case "high":
        return "priority-high"
      case "normal":
        return "priority-normal"
      case "low":
        return "priority-low"
      default:
        return ""
    }
  }

  if (loading) {
    return <div className="loading">Loading announcements...</div>
  }

  if (error) {
    return <div className="error-message">{error}</div>
  }

  if (announcements.length === 0) {
    return <div className="no-announcements">No announcements available.</div>
  }

  return (
    <div className="announcement-list">
      <h2>Announcements</h2>

      {announcements.map((announcement) => (
        <div
          key={announcement.announcement_id}
          className={`announcement-item ${getPriorityClass(announcement.priority)}`}
        >
          <div className="announcement-header">
            <h3>{announcement.title}</h3>
            <div className="announcement-meta">
              <span className="announcement-date">Posted: {formatDate(announcement.created_at)}</span>
              {announcement.priority !== "normal" && (
                <span className={`announcement-priority ${getPriorityClass(announcement.priority)}`}>
                  {announcement.priority.toUpperCase()}
                </span>
              )}
            </div>
          </div>

          <div className="announcement-content">
            {announcement.content.split("\n").map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          <div className="announcement-footer">
            <span className="announcement-author">Posted by: {announcement.creator_name}</span>
            {announcement.end_date && (
              <span className="announcement-expiry">Valid until: {formatDate(announcement.end_date)}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default AnnouncementList
