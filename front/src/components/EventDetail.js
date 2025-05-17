"use client"

import { useState, useEffect } from "react"
import { getUserRole, isAuthenticated } from "../utils/auth"
import api from "../utils/api"

const EventDetail = ({ event, onBack, onEdit, onDelete, onManageHelpers, onManageAttendance }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [isRegistered, setIsRegistered] = useState(false)
  const [isVolunteered, setIsVolunteered] = useState(false)
  const [registrationLoading, setRegistrationLoading] = useState(false)

  const userRole = getUserRole()
  const isAuth = isAuthenticated()
  const isLeader = userRole === "leader" || userRole === "admin"
  const isHelper = userRole === "helper"

  useEffect(() => {
    // Check if user is registered for this event
    const checkRegistration = async () => {
      if (isAuth && event) {
        try {
          const response = await api.get(`/events/${event.id}/register`)
          setIsRegistered(response.data.isRegistered)
        } catch (error) {
          console.error("Error checking registration:", error)
        }
      }
    }

    // Check if helper has volunteered for this event
    const checkVolunteered = async () => {
      if (isAuth && isHelper && event) {
        try {
          // First get the helper ID for this user
          const userResponse = await api.get("/auth/user")
          const userId = userResponse.data.user.id

          // Then get the helper profile
          const helperResponse = await api.get(`/helpers/user/${userId}`)
          const helperId = helperResponse.data.helper.id

          // Check if this helper is in the event's helpers list
          const isVolunteered = event.helpers && event.helpers.some((helper) => helper.id === helperId)
          setIsVolunteered(isVolunteered)
        } catch (error) {
          console.error("Error checking if volunteered:", error)
        }
      }
    }

    checkRegistration()
    checkVolunteered()
  }, [event, isAuth, isHelper])

  const formatDate = (dateString) => {
    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const formatTime = (timeString) => {
    if (!timeString) return ""
    const [hours, minutes] = timeString.split(":")
    return `${hours}:${minutes}`
  }

  const handleVolunteer = async () => {
    if (!isAuth || !isHelper) {
      setError("You must be logged in as a helper to volunteer")
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      await api.post(`/events/${event.id}/volunteer`)
      setSuccess("You have successfully volunteered for this event")
      setIsVolunteered(true)
    } catch (error) {
      console.error("Error volunteering for event:", error)
      setError(error.response?.data?.message || "Failed to volunteer for event")
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!isAuth) {
      setError("You must be logged in to register for events")
      return
    }

    setRegistrationLoading(true)
    setError(null)
    setSuccess(null)

    try {
      await api.post(`/events/${event.id}/register`)
      setSuccess("You have successfully registered for this event")
      setIsRegistered(true)
    } catch (error) {
      console.error("Error registering for event:", error)
      setError(error.response?.data?.message || "Failed to register for event")
    } finally {
      setRegistrationLoading(false)
    }
  }

  const handleCancelRegistration = async () => {
    if (!isAuth) {
      setError("You must be logged in to cancel registration")
      return
    }

    if (!window.confirm("Are you sure you want to cancel your registration?")) {
      return
    }

    setRegistrationLoading(true)
    setError(null)
    setSuccess(null)

    try {
      await api.delete(`/events/${event.id}/register`)
      setSuccess("Your registration has been cancelled")
      setIsRegistered(false)
    } catch (error) {
      console.error("Error cancelling registration:", error)
      setError(error.response?.data?.message || "Failed to cancel registration")
    } finally {
      setRegistrationLoading(false)
    }
  }

  return (
    <div className="event-detail">
      <button onClick={onBack} className="back-button">
        &larr; Back to Events
      </button>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="event-detail-header">
        <h2>{event.title}</h2>
        <div className="event-type-badge">{event.eventType}</div>
      </div>

      <div className="event-detail-content">
        <div className="event-detail-section">
          <h3>When</h3>
          <div className="event-datetime">
            <div className="event-date">{formatDate(event.startDate)}</div>
            {event.endDate && event.endDate !== event.startDate && (
              <div className="event-date">to {formatDate(event.endDate)}</div>
            )}
            {event.startTime && (
              <div className="event-time">
                {formatTime(event.startTime)}
                {event.endTime && ` - ${formatTime(event.endTime)}`}
              </div>
            )}
          </div>
        </div>

        <div className="event-detail-section">
          <h3>Where</h3>
          <div className="event-location">
            <div className="location-name">{event.locationName}</div>
            {event.locationAddress && <div className="location-address">{event.locationAddress}</div>}
          </div>
        </div>

        {event.description && (
          <div className="event-detail-section">
            <h3>Description</h3>
            <div className="event-description">{event.description}</div>
          </div>
        )}

        {event.cost && (
          <div className="event-detail-section">
            <h3>Cost</h3>
            <div className="event-cost">£{Number.parseFloat(event.cost).toFixed(2)}</div>
          </div>
        )}

        {event.badges && event.badges.length > 0 && (
          <div className="event-detail-section">
            <h3>Badges</h3>
            <div className="event-badges-list">
              {event.badges.map((badge) => (
                <div key={badge.id} className="event-badge">
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
                      <div className="placeholder-image">
                        <span>{badge.name.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  <div className="badge-name">{badge.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isLeader && event.helpers && event.helpers.length > 0 && (
          <div className="event-detail-section">
            <h3>Helpers ({event.helpers.length})</h3>
            <div className="event-helpers-list">
              {event.helpers.map((helper) => (
                <div key={helper.id} className="event-helper">
                  <div className="helper-name">
                    {helper.firstName} {helper.lastName}
                  </div>
                  <div className={`helper-status ${helper.confirmed ? "confirmed" : "pending"}`}>
                    {helper.confirmed ? "Confirmed" : "Pending"}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => onManageHelpers(event.id)} className="manage-helpers-button">
              Manage Helpers
            </button>
          </div>
        )}

        {isLeader && event.participants && event.participants.length > 0 && (
          <div className="event-detail-section">
            <h3>Participants ({event.participants.length})</h3>
            <div className="event-participants-list">
              {event.participants.map((participant) => (
                <div key={participant.id} className="event-participant">
                  <div className="participant-name">
                    {participant.firstName} {participant.lastName}
                  </div>
                  <div className={`participant-status ${participant.status}`}>
                    {participant.status.charAt(0).toUpperCase() + participant.status.slice(1)}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => onManageAttendance(event.id)} className="manage-attendance-button">
              Manage Attendance
            </button>
          </div>
        )}

        {event.notes && isLeader && (
          <div className="event-detail-section">
            <h3>Notes</h3>
            <div className="event-notes">{event.notes}</div>
          </div>
        )}

        {event.equipment && isLeader && (
          <div className="event-detail-section">
            <h3>Equipment</h3>
            <div className="event-equipment">{event.equipment}</div>
          </div>
        )}

        {event.creator && (
          <div className="event-creator">
            Created by {event.creator.firstName} {event.creator.lastName}
          </div>
        )}
      </div>

      <div className="event-actions">
        {isLeader && (
          <>
            <button onClick={() => onEdit(event.id)} className="edit-button">
              Edit Event
            </button>
            <button onClick={() => onDelete(event.id)} className="delete-button">
              Delete Event
            </button>
            <button onClick={() => onManageHelpers(event.id)} className="manage-button">
              Manage Helpers
            </button>
            <button onClick={() => onManageAttendance(event.id)} className="manage-button">
              Manage Attendance
            </button>
          </>
        )}

        {isHelper && !isVolunteered && (
          <button onClick={handleVolunteer} disabled={loading} className="volunteer-button">
            {loading ? "Volunteering..." : "Volunteer to Help"}
          </button>
        )}

        {isHelper && isVolunteered && <div className="already-volunteered">You have volunteered for this event</div>}

        {isAuth && !isLeader && !isHelper && !isRegistered && (
          <button onClick={handleRegister} disabled={registrationLoading} className="register-button">
            {registrationLoading ? "Registering..." : "Register for Event"}
          </button>
        )}

        {isAuth && !isLeader && !isHelper && isRegistered && (
          <button onClick={handleCancelRegistration} disabled={registrationLoading} className="cancel-button">
            {registrationLoading ? "Cancelling..." : "Cancel Registration"}
          </button>
        )}

        {!isAuth && (
          <div className="login-prompt">
            Please <a href="/login">log in</a> to register for this event
          </div>
        )}
      </div>
    </div>
  )
}

export default EventDetail
