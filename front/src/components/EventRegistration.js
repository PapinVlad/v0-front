"use client"

import { useState } from "react"
import { isAuthenticated } from "../utils/auth"
import api from "../utils/api"

const EventRegistration = ({ event, isRegistered, onRegistrationChange }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [notes, setNotes] = useState("")

  const isAuth = isAuthenticated()
  const eventDate = new Date(event.startDate)
  const isPastEvent = eventDate < new Date()
  const isFull = event.maxParticipants > 0 && event.participantCount >= event.maxParticipants

  const handleRegister = async (e) => {
    e.preventDefault()

    if (!isAuth) {
      setError("You must be logged in to register for events")
      return
    }

    if (isPastEvent) {
      setError("Cannot register for past events")
      return
    }

    if (isFull) {
      setError("This event has reached its maximum number of participants")
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      await api.post(`/events/${event.id}/register`, { notes })
      setSuccess("You have successfully registered for this event")
      setNotes("")
      if (onRegistrationChange) {
        onRegistrationChange(true)
      }
    } catch (error) {
      console.error("Error registering for event:", error)
      setError(error.response?.data?.message || "Failed to register for event")
    } finally {
      setLoading(false)
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

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      await api.delete(`/events/${event.id}/register`)
      setSuccess("Your registration has been cancelled")
      if (onRegistrationChange) {
        onRegistrationChange(false)
      }
    } catch (error) {
      console.error("Error cancelling registration:", error)
      setError(error.response?.data?.message || "Failed to cancel registration")
    } finally {
      setLoading(false)
    }
  }

  if (!isAuth) {
    return (
      <div className="event-registration">
        <div className="login-prompt">
          Please <a href="/login">log in</a> to register for this event
        </div>
      </div>
    )
  }

  if (isPastEvent) {
    return (
      <div className="event-registration">
        <div className="past-event-message">This event has already taken place</div>
      </div>
    )
  }

  if (isRegistered) {
    return (
      <div className="event-registration">
        <div className="registration-status">
          <div className="registered-message">You are registered for this event</div>
          <button onClick={handleCancelRegistration} disabled={loading} className="cancel-button">
            {loading ? "Cancelling..." : "Cancel Registration"}
          </button>
        </div>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
      </div>
    )
  }

  return (
    <div className="event-registration">
      <h3>Register for this Event</h3>

      {isFull ? (
        <div className="event-full-message">This event is full</div>
      ) : (
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label htmlFor="notes">Notes (optional)</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special requirements or information"
              rows="3"
            ></textarea>
          </div>

          <button type="submit" disabled={loading} className="register-button">
            {loading ? "Registering..." : "Register Now"}
          </button>
        </form>
      )}

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {event.maxParticipants > 0 && (
        <div className="participant-count">
          {event.participantCount || 0} of {event.maxParticipants} spots filled
        </div>
      )}
    </div>
  )
}

export default EventRegistration
