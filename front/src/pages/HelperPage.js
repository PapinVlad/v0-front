"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import api from "../utils/api"
import { getCurrentUser } from "../utils/auth"

const HelperPage = () => {
  const [helperEvents, setHelperEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [needsRegistration, setNeedsRegistration] = useState(false)
  const [userData, setUserData] = useState(null)

  useEffect(() => {
    const controller = new AbortController()

    const fetchHelperEvents = async () => {
      try {
        setLoading(true)

        // First get the current user
        const { user } = await getCurrentUser()
        setUserData(user)

        try {
          // Then get the helper profile
          const helperResponse = await api.get(`/helpers/user/${user.id}`, {
            signal: controller.signal,
          })

          if (!helperResponse.data || !helperResponse.data.helper) {
            console.log("Helper profile not found. User needs to register as a helper.")
            setNeedsRegistration(true)
            setLoading(false)
            return
          }

          const helperId = helperResponse.data.helper.id

          // Finally get the events for this helper
          const eventsResponse = await api.get(`/events/helpers/${helperId}`, {
            signal: controller.signal,
          })

          setHelperEvents(eventsResponse.data.events || [])
        } catch (error) {
          if (error.response && error.response.status === 404) {
            console.log("Helper profile not found. User needs to register as a helper.")
            setNeedsRegistration(true)
          } else if (error.name !== "CanceledError") {
            console.error("Error fetching helper data:", error)
            setError("Failed to load helper data. Please try again later.")
          }
        }
      } catch (error) {
        if (error.name !== "CanceledError") {
          console.error("Error fetching helper events:", error)
          setError("Failed to load helper events. Please try again later.")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchHelperEvents()

    return () => {
      controller.abort()
    }
  }, [])

  if (loading) {
    return <div className="loading">Loading helper dashboard...</div>
  }

  if (needsRegistration) {
    return (
      <div className="helper-registration-needed">
        <h1>Complete Your Helper Profile</h1>
        {userData && (
          <p>
            Hello, {userData.firstName} {userData.lastName}! You need to complete your helper profile before you can
            volunteer for events.
          </p>
        )}
        <div className="registration-actions">
          <Link to="/helper/register" className="register-button">
            Complete Helper Profile
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="helper-page">
      <h1>Helper Dashboard</h1>
      {userData && (
        <div className="welcome-message">
          <p>
            Welcome, {userData.firstName} {userData.lastName}!
          </p>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      <div className="helper-events">
        <h2>Your Volunteered Events</h2>
        {helperEvents.length === 0 ? (
          <p>You haven't volunteered for any events yet. Check the events page to find opportunities.</p>
        ) : (
          <ul className="event-list">
            {helperEvents.map((event) => (
              <li key={event.id} className="event-item">
                <div className="event-title">{event.title}</div>
                <div className="event-date">
                  {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                </div>
                <div className="event-location">{event.locationName}</div>
                <div className="event-status">
                  Status:{" "}
                  <span className={event.confirmed ? "confirmed" : "pending"}>
                    {event.confirmed ? "Confirmed" : "Pending"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="helper-actions">
        <Link to="/events" className="view-events-button">
          View All Events
        </Link>
      </div>
    </div>
  )
}

export default HelperPage
