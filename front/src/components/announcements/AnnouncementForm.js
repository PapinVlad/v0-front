"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../utils/api"


const AnnouncementForm = ({ announcement = null, isEdit = false }) => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: announcement?.title || "",
    content: announcement?.content || "",
    startDate: announcement?.start_date ? new Date(announcement.start_date).toISOString().split("T")[0] : "",
    endDate: announcement?.end_date ? new Date(announcement.end_date).toISOString().split("T")[0] : "",
    priority: announcement?.priority || "normal",
    targetRole: announcement?.target_role || "all",
    isActive: announcement?.is_active !== undefined ? announcement.is_active : true,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.title || !formData.content) {
      setError("Title and content are required")
      return
    }

    try {
      setLoading(true)

      if (isEdit && announcement) {
        await api.put(`/announcements/${announcement.announcement_id}`, formData)
      } else {
        await api.post("/announcements", formData)
      }

      navigate("/admin/announcements")
    } catch (error) {
      console.error("Error saving announcement:", error)
      setError("Failed to save announcement. Please try again later.")
      setLoading(false)
    }
  }

  return (
    <div className="announcement-form">
      <h2>{isEdit ? "Edit Announcement" : "Create New Announcement"}</h2>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title:</label>
          <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label htmlFor="content">Content:</label>
          <textarea id="content" name="content" value={formData.content} onChange={handleChange} rows="6" required />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="startDate">Start Date (Optional):</label>
            <input type="date" id="startDate" name="startDate" value={formData.startDate} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label htmlFor="endDate">End Date (Optional):</label>
            <input type="date" id="endDate" name="endDate" value={formData.endDate} onChange={handleChange} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="priority">Priority:</label>
            <select id="priority" name="priority" value={formData.priority} onChange={handleChange}>
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="targetRole">Target Audience:</label>
            <select id="targetRole" name="targetRole" value={formData.targetRole} onChange={handleChange}>
              <option value="all">Everyone</option>
              <option value="leader">Leaders Only</option>
              <option value="helper">Helpers Only</option>
              <option value="public">Public Users Only</option>
            </select>
          </div>
        </div>

        {isEdit && (
          <div className="form-group checkbox-group">
            <label>
              <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} />
              Active
            </label>
          </div>
        )}

        <div className="form-actions">
          <button type="button" onClick={() => navigate("/admin/announcements")} className="cancel-button">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="save-button">
            {loading ? "Saving..." : "Save Announcement"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AnnouncementForm
