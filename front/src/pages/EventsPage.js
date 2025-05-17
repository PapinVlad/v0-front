"use client"

import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { isAuthenticated, getUserRole } from "../utils/auth"
import api from "../utils/api"
import EventList from "../components/EventList"
import EventDetail from "../components/EventDetail"
import EventFilter from "../components/EventFilter"
import EventForm from "../components/EventForm"
import EventHelperManagement from "../components/EventHelperManagement"
import EventAttendance from "../components/EventAttendance"
import EventRegistration from "../components/EventRegistration"
import EventStatistics from "../components/EventStatistics"

const EventsPage = () => {
  const [events, setEvents] = useState([])
  const [selectedEventId, setSelectedEventId] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    upcoming: true,
    past: false,
    eventType: "",
    startDate: "",
    endDate: "",
  })
  const [view, setView] = useState("list") // list, detail, create, edit, helpers, attendance, stats
  const [isRegistered, setIsRegistered] = useState(false)
  const [volunteeredEvents, setVolunteeredEvents] = useState([])
  const navigate = useNavigate()

  const userRole = getUserRole()
  const isAuth = isAuthenticated()
  const isLeader = userRole === "leader" || userRole === "admin"
  const isHelper = userRole === "helper"

  useEffect(() => {
    // Redirect if not authenticated for helper-only pages
    if (view === "helpers" && !isAuth) {
      navigate("/login")
    }
  }, [view, isAuth, navigate])

  // Memoize the handleFilterChange function to prevent it from changing on every render
  const handleFilterChange = useCallback((newFilters) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      ...newFilters,
    }))
  }, [])

  useEffect(() => {
    // Create controller outside the fetchEvents function so it's accessible in the cleanup function
    const controller = new AbortController()

    const fetchEvents = async () => {
      try {
        setLoading(true)
        const response = await api.get("/events", {
          params: filters,
          signal: controller.signal,
        })
        setEvents(response.data.events || []) // Ensure we always have an array
      } catch (error) {
        if (error.name !== "CanceledError") {
          console.error("Error fetching events:", error)
          setError("Failed to load events. Please try again later.")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()

    return () => {
      // Cleanup function to abort any pending requests when component unmounts or dependencies change
      controller.abort()
    }
  }, [filters])

  useEffect(() => {
    // Fetch volunteered events for the current helper
    const controller = new AbortController()

    const fetchVolunteeredEvents = async () => {
      if (isAuth && isHelper) {
        try {
          // First get the helper ID for this user
          const userResponse = await api.get("/auth/user", {
            signal: controller.signal,
          })

          if (!userResponse.data || !userResponse.data.user) {
            console.error("User data not found")
            return
          }

          const userId = userResponse.data.user.id

          try {
            // Then get the helper profile
            const helperResponse = await api.get(`/helpers/user/${userId}`, {
              signal: controller.signal,
            })

            if (!helperResponse.data || !helperResponse.data.helper) {
              console.log("Helper profile not found for user ID:", userId)
              return
            }

            const helperId = helperResponse.data.helper.id

            // Finally get the events for this helper
            const eventsResponse = await api.get(`/events/helpers/${helperId}`, {
              signal: controller.signal,
            })

            if (eventsResponse.data && Array.isArray(eventsResponse.data.events)) {
              setVolunteeredEvents(eventsResponse.data.events.map((event) => event.id))
            }
          } catch (error) {
            if (error.response && error.response.status === 404) {
              console.log("Helper profile not found for this user. This is normal for non-helper users.")
            } else if (error.name !== "CanceledError") {
              console.error("Error fetching helper data:", error)
            }
          }
        } catch (error) {
          if (error.name !== "CanceledError") {
            console.error("Error fetching volunteered events:", error)
          }
        }
      }
    }

    fetchVolunteeredEvents()

    return () => {
      controller.abort()
    }
  }, [isAuth, isHelper])

  useEffect(() => {
    // Fetch selected event details
    const controller = new AbortController()

    const fetchEventDetails = async () => {
      if (selectedEventId) {
        try {
          setLoading(true)
          const response = await api.get(`/events/${selectedEventId}`, {
            signal: controller.signal,
          })
          setSelectedEvent(response.data.event)
          setView("detail")

          // Check if user is registered for this event
          if (isAuth) {
            try {
              const regResponse = await api.get(`/events/${selectedEventId}/register`, {
                signal: controller.signal,
              })
              setIsRegistered(regResponse.data.isRegistered)
            } catch (error) {
              if (error.name !== "CanceledError") {
                console.error("Error checking registration status:", error)
              }
            }
          }
        } catch (error) {
          if (error.name !== "CanceledError") {
            console.error("Error fetching event details:", error)
            setError("Failed to load event details. Please try again later.")
          }
        } finally {
          setLoading(false)
        }
      } else {
        setSelectedEvent(null)
      }
    }

    fetchEventDetails()

    return () => {
      controller.abort()
    }
  }, [selectedEventId, isAuth])

  const handleEventSelect = (eventId) => {
    setSelectedEventId(eventId)
  }

  const handleBackToList = () => {
    setSelectedEventId(null)
    setView("list")
  }

  const handleCreateEvent = () => {
    setSelectedEventId(null)
    setSelectedEvent(null)
    setView("create")
  }

  const handleEditEvent = (eventId) => {
    setSelectedEventId(eventId)
    setView("edit")
  }

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) {
      return
    }

    try {
      setLoading(true)
      await api.delete(`/events/${eventId}`)
      setSelectedEventId(null)
      setSelectedEvent(null)
      setView("list")

      // Refresh events list
      const response = await api.get("/events", {
        params: filters,
      })
      setEvents(response.data.events || [])
    } catch (error) {
      console.error("Error deleting event:", error)
      setError("Failed to delete event. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleManageHelpers = (eventId) => {
    setSelectedEventId(eventId)
    setView("helpers")
  }

  const handleManageAttendance = (eventId) => {
    setSelectedEventId(eventId)
    setView("attendance")
  }

  const handleViewStatistics = () => {
    setSelectedEventId(null)
    setSelectedEvent(null)
    setView("stats")
  }

  const handleSubmitEvent = async (formData) => {
    try {
      setLoading(true)
      if (view === "edit" && selectedEventId) {
        // Update existing event
        await api.put(`/events/${selectedEventId}`, formData)
      } else {
        // Create new event
        await api.post("/events", formData)
      }

      // Refresh events list
      const response = await api.get("/events", {
        params: filters,
      })
      setEvents(response.data.events || [])

      // Return to list view
      setSelectedEventId(null)
      setSelectedEvent(null)
      setView("list")
    } catch (error) {
      console.error("Error saving event:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const handleRegistrationChange = (newStatus) => {
    setIsRegistered(newStatus)
  }

  return (
    <div className="events-page">
      <div className="events-header">
        <h1>Events</h1>
        <div className="events-actions">
          {isLeader && (
            <>
              <button onClick={handleCreateEvent} className="create-button">
                Create Event
              </button>
              <button onClick={handleViewStatistics} className="stats-button">
                View Statistics
              </button>
            </>
          )}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {view === "list" && (
        <>
          <EventFilter onFilterChange={handleFilterChange} />
          {loading ? (
            <div className="loading">Loading events...</div>
          ) : (
            <EventList events={events} onEventSelect={handleEventSelect} />
          )}
        </>
      )}

      {view === "detail" && selectedEvent && (
        <>
          <EventDetail
            event={selectedEvent}
            onBack={handleBackToList}
            onEdit={isLeader ? handleEditEvent : null}
            onDelete={isLeader ? handleDeleteEvent : null}
            onManageHelpers={isLeader ? handleManageHelpers : null}
            onManageAttendance={isLeader ? handleManageAttendance : null}
            isVolunteered={volunteeredEvents.includes(selectedEvent.id)}
          />
          {!isLeader && !isHelper && (
            <EventRegistration
              event={selectedEvent}
              isRegistered={isRegistered}
              onRegistrationChange={handleRegistrationChange}
            />
          )}
        </>
      )}

      {view === "create" && <EventForm onSubmit={handleSubmitEvent} onCancel={handleBackToList} />}

      {view === "edit" && selectedEvent && (
        <EventForm event={selectedEvent} onSubmit={handleSubmitEvent} onCancel={handleBackToList} />
      )}

      {view === "helpers" && selectedEventId && (
        <div className="helper-management-view">
          <button onClick={handleBackToList} className="back-button">
            &larr; Back to Events
          </button>
          <EventHelperManagement eventId={selectedEventId} />
        </div>
      )}

      {view === "attendance" && selectedEventId && (
        <div className="attendance-view">
          <button onClick={handleBackToList} className="back-button">
            &larr; Back to Events
          </button>
          <EventAttendance eventId={selectedEventId} />
        </div>
      )}

      {view === "stats" && (
        <div className="statistics-view">
          <button onClick={handleBackToList} className="back-button">
            &larr; Back to Events
          </button>
          <EventStatistics />
        </div>
      )}
    </div>
  )
}

export default EventsPage
