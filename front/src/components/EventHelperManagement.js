"use client"

import { useState, useEffect } from "react"
import api from "../utils/api"

const EventHelperManagement = ({ eventId }) => {
  const [event, setEvent] = useState(null)
  const [availableHelpers, setAvailableHelpers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const eventResponse = await api.get(`/events/${eventId}`)
        setEvent(eventResponse.data.event)

        // Only fetch available helpers if we have date and time
        if (eventResponse.data.event.startDate && eventResponse.data.event.startTime) {
          const helpersResponse = await api.get(
            `/events/${eventId}/available-helpers?eventDate=${eventResponse.data.event.startDate}&startTime=${eventResponse.data.event.startTime}&endTime=${eventResponse.data.event.endTime || eventResponse.data.event.startTime}`,
          )
          setAvailableHelpers(helpersResponse.data.helpers)
        }
      } catch (error) {
        console.error("Error fetching event data:", error)
        setError("Failed to load event data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [eventId])

  const handleAssignHelper = async (helperId) => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      await api.post("/events/helpers", {
        eventId,
        helperId,
        confirmed: true,
      })

      // Refresh event data
      const eventResponse = await api.get(`/events/${eventId}`)
      setEvent(eventResponse.data.event)

      setSuccess("Helper assigned successfully")
    } catch (error) {
      console.error("Error assigning helper:", error)
      setError(error.response?.data?.message || "Failed to assign helper")
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveHelper = async (helperId) => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      await api.delete(`/events/${eventId}/helpers/${helperId}`)

      // Refresh event data
      const eventResponse = await api.get(`/events/${eventId}`)
      setEvent(eventResponse.data.event)

      setSuccess("Helper removed successfully")
    } catch (error) {
      console.error("Error removing helper:", error)
      setError(error.response?.data?.message || "Failed to remove helper")
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmHelper = async (helperId, confirmed) => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      await api.put(`/events/${eventId}/helpers/${helperId}`, {
        confirmed,
      })

      // Refresh event data
      const eventResponse = await api.get(`/events/${eventId}`)
      setEvent(eventResponse.data.event)

      setSuccess(`Helper ${confirmed ? "confirmed" : "unconfirmed"} successfully`)
    } catch (error) {
      console.error("Error updating helper confirmation:", error)
      setError(error.response?.data?.message || "Failed to update helper confirmation")
    } finally {
      setLoading(false)
    }
  }

  if (loading && !event) {
    return <div className="loading">Loading event data...</div>
  }

  if (error && !event) {
    return <div className="error-message">{error}</div>
  }

  if (!event) {
    return <div className="error-message">Event not found</div>
  }

  // Filter out helpers that are already assigned
  const assignedHelperIds = event.helpers ? event.helpers.map((helper) => helper.id) : []
  const unassignedHelpers = availableHelpers.filter((helper) => !assignedHelperIds.includes(helper.id))

  return (
    <div className="event-helper-management">
      <h2>Helper Management for {event.title}</h2>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="helper-management-content">
        <div className="helper-section">
          <h3>Assigned Helpers ({event.helpers ? event.helpers.length : 0})</h3>
          {event.helpers && event.helpers.length > 0 ? (
            <div className="assigned-helpers">
              {event.helpers.map((helper) => (
                <div key={helper.id} className="helper-card">
                  <div className="helper-info">
                    <div className="helper-name">
                      {helper.firstName} {helper.lastName}
                    </div>
                    <div className="helper-email">{helper.email}</div>
                    <div className={`helper-status ${helper.confirmed ? "confirmed" : "pending"}`}>
                      {helper.confirmed ? "Confirmed" : "Pending Confirmation"}
                    </div>
                  </div>
                  <div className="helper-actions">
                    {!helper.confirmed ? (
                      <button
                        onClick={() => handleConfirmHelper(helper.id, true)}
                        className="confirm-button"
                        disabled={loading}
                      >
                        Confirm
                      </button>
                    ) : (
                      <button
                        onClick={() => handleConfirmHelper(helper.id, false)}
                        className="unconfirm-button"
                        disabled={loading}
                      >
                        Unconfirm
                      </button>
                    )}
                    <button onClick={() => handleRemoveHelper(helper.id)} className="remove-button" disabled={loading}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-helpers">No helpers assigned to this event yet</div>
          )}
        </div>

        <div className="helper-section">
          <h3>Available Helpers ({unassignedHelpers.length})</h3>
          {!event.startDate || !event.startTime ? (
            <div className="warning-message">Please set event date and time to see available helpers</div>
          ) : unassignedHelpers.length > 0 ? (
            <div className="available-helpers">
              {unassignedHelpers.map((helper) => (
                <div key={helper.id} className="helper-card">
                  <div className="helper-info">
                    <div className="helper-name">
                      {helper.firstName} {helper.lastName}
                    </div>
                    <div className="helper-email">{helper.email}</div>
                    <div className="helper-meta">
                      {helper.disclosureStatus && <span className="disclosure-badge">Disclosure</span>}
                      {helper.trainingCompleted && <span className="training-badge">Training</span>}
                    </div>
                  </div>
                  <div className="helper-actions">
                    <button onClick={() => handleAssignHelper(helper.id)} className="assign-button" disabled={loading}>
                      Assign
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-helpers">No additional helpers available for this time slot</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EventHelperManagement
