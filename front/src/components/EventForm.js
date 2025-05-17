"use client"

import { useState, useEffect } from "react"
import api from "../utils/api"

const EventForm = ({ event, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    locationName: "",
    locationAddress: "",
    latitude: "",
    longitude: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    eventType: "Meeting",
    requiredHelpers: 0,
    notes: "",
    equipment: "",
    cost: "",
    publicVisible: true,
    leadersOnlyVisible: false,
    helpersOnlyVisible: false,
    badgeIds: [],
  })

  const [badges, setBadges] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Fetch badges
    const fetchBadges = async () => {
      try {
        const response = await api.get("/badges")
        setBadges(response.data.badges)
      } catch (error) {
        console.error("Error fetching badges:", error)
        setError("Failed to load badges. Please try again later.")
      }
    }

    fetchBadges()

    // If editing, populate form with event data
    if (event) {
      setFormData({
        title: event.title || "",
        description: event.description || "",
        locationName: event.locationName || "",
        locationAddress: event.locationAddress || "",
        latitude: event.latitude || "",
        longitude: event.longitude || "",
        startDate: event.startDate ? new Date(event.startDate).toISOString().split("T")[0] : "",
        endDate: event.endDate ? new Date(event.endDate).toISOString().split("T")[0] : "",
        startTime: event.startTime || "",
        endTime: event.endTime || "",
        eventType: event.eventType || "Meeting",
        requiredHelpers: event.requiredHelpers || 0,
        notes: event.notes || "",
        equipment: event.equipment || "",
        cost: event.cost || "",
        publicVisible: event.publicVisible !== undefined ? event.publicVisible : true,
        leadersOnlyVisible: event.leadersOnlyVisible || false,
        helpersOnlyVisible: event.helpersOnlyVisible || false,
        badgeIds: event.badges ? event.badges.map((badge) => badge.id) : [],
      })
    }
  }, [event])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleBadgeChange = (e) => {
    const badgeId = Number.parseInt(e.target.value)
    const isChecked = e.target.checked

    setFormData((prev) => {
      if (isChecked) {
        return {
          ...prev,
          badgeIds: [...prev.badgeIds, badgeId],
        }
      } else {
        return {
          ...prev,
          badgeIds: prev.badgeIds.filter((id) => id !== badgeId),
        }
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await onSubmit(formData)
    } catch (error) {
      console.error("Error submitting event:", error)
      setError(error.response?.data?.message || "Failed to save event. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="event-form">
      <h2>{event ? "Edit Event" : "Create New Event"}</h2>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Event Details</h3>

          <div className="form-group">
            <label htmlFor="title">Event Title</label>
            <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="eventType">Event Type</label>
            <select id="eventType" name="eventType" value={formData.eventType} onChange={handleChange}>
              <option value="Meeting">Meeting</option>
              <option value="Outing">Outing</option>
              <option value="Camp">Camp</option>
              <option value="Training">Training</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">Start Date</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="endDate">End Date (Optional)</label>
              <input type="date" id="endDate" name="endDate" value={formData.endDate} onChange={handleChange} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startTime">Start Time (Optional)</label>
              <input type="time" id="startTime" name="startTime" value={formData.startTime} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label htmlFor="endTime">End Time (Optional)</label>
              <input type="time" id="endTime" name="endTime" value={formData.endTime} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="cost">Cost (Optional)</label>
            <input
              type="number"
              id="cost"
              name="cost"
              value={formData.cost}
              onChange={handleChange}
              step="0.01"
              min="0"
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Location</h3>

          <div className="form-group">
            <label htmlFor="locationName">Location Name</label>
            <input
              type="text"
              id="locationName"
              name="locationName"
              value={formData.locationName}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="locationAddress">Address</label>
            <textarea
              id="locationAddress"
              name="locationAddress"
              value={formData.locationAddress}
              onChange={handleChange}
              rows="2"
            ></textarea>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="latitude">Latitude (Optional)</label>
              <input type="text" id="latitude" name="latitude" value={formData.latitude} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label htmlFor="longitude">Longitude (Optional)</label>
              <input type="text" id="longitude" name="longitude" value={formData.longitude} onChange={handleChange} />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Helpers</h3>

          <div className="form-group">
            <label htmlFor="requiredHelpers">Number of Helpers Required</label>
            <input
              type="number"
              id="requiredHelpers"
              name="requiredHelpers"
              value={formData.requiredHelpers}
              onChange={handleChange}
              min="0"
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Badges</h3>
          <div className="badge-checkboxes">
            {badges.map((badge) => (
              <label key={badge.id} className="badge-checkbox">
                <input
                  type="checkbox"
                  value={badge.id}
                  checked={formData.badgeIds.includes(badge.id)}
                  onChange={handleBadgeChange}
                />
                {badge.name}
              </label>
            ))}
          </div>
        </div>

        <div className="form-section">
          <h3>Visibility</h3>

          <div className="form-group">
            <label className="checkbox-label">
              <input type="checkbox" name="publicVisible" checked={formData.publicVisible} onChange={handleChange} />
              Visible to Public
            </label>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="helpersOnlyVisible"
                checked={formData.helpersOnlyVisible}
                onChange={handleChange}
              />
              Visible to Helpers Only
            </label>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="leadersOnlyVisible"
                checked={formData.leadersOnlyVisible}
                onChange={handleChange}
              />
              Visible to Leaders Only
            </label>
          </div>
        </div>

        <div className="form-section">
          <h3>Additional Information (Leaders Only)</h3>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows="3"></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="equipment">Equipment Needed</label>
            <textarea
              id="equipment"
              name="equipment"
              value={formData.equipment}
              onChange={handleChange}
              rows="3"
            ></textarea>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading} className="submit-button">
            {loading ? "Saving..." : event ? "Update Event" : "Create Event"}
          </button>
          <button type="button" onClick={onCancel} className="cancel-button">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default EventForm
