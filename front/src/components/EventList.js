"use client"

import { useState } from "react"

const EventList = ({ events, onEventSelect }) => {
  const [sortBy, setSortBy] = useState("date") // 'date' or 'title'

  const formatDate = (dateString) => {
    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const formatTime = (timeString) => {
    if (!timeString) return ""
    const [hours, minutes] = timeString.split(":")
    return `${hours}:${minutes}`
  }

  const sortedEvents = [...events].sort((a, b) => {
    if (sortBy === "date") {
      return new Date(a.startDate) - new Date(b.startDate)
    } else {
      return a.title.localeCompare(b.title)
    }
  })

  if (events.length === 0) {
    return <div className="no-events">No events found</div>
  }

  return (
    <div className="event-list">
      <div className="event-list-header">
        <div className="event-count">{events.length} events</div>
        <div className="sort-controls">
          <label htmlFor="sort-select">Sort by:</label>
          <select id="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="date">Date</option>
            <option value="title">Title</option>
          </select>
        </div>
      </div>

      <div className="events-grid">
        {sortedEvents.map((event) => (
          <div key={event.id} className="event-card" onClick={() => onEventSelect(event.id)}>
            <div className="event-date">
              <div className="date-day">{new Date(event.startDate).getDate()}</div>
              <div className="date-month">
                {new Date(event.startDate).toLocaleString("default", { month: "short" })}
              </div>
            </div>
            <div className="event-details">
              <h3 className="event-title">{event.title}</h3>
              <div className="event-meta">
                <span className="event-type">{event.eventType}</span>
                {event.startTime && (
                  <span className="event-time">
                    {formatTime(event.startTime)}
                    {event.endTime && ` - ${formatTime(event.endTime)}`}
                  </span>
                )}
              </div>
              <div className="event-location">{event.locationName}</div>
              {event.badgeCount > 0 && <div className="event-badges">Badges: {event.badgeCount}</div>}
              <div className="event-participants">
                <span className="helper-count">
                  Helpers: {event.helperCount || 0}/{event.requiredHelpers}
                </span>
                {event.maxParticipants > 0 && (
                  <span className="participant-count">
                    Participants: {event.participantCount || 0}/{event.maxParticipants}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default EventList
