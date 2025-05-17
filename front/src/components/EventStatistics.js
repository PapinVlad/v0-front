"use client"

import { useState, useEffect } from "react"
import api from "../utils/api"

const EventStatistics = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/events/statistics")
        setStats(response.data.stats)
      } catch (error) {
        console.error("Error fetching event statistics:", error)
        setError("Failed to load statistics. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return <div className="loading">Loading statistics...</div>
  }

  if (error) {
    return <div className="error-message">{error}</div>
  }

  if (!stats) {
    return <div className="no-stats">No event statistics available</div>
  }

  // Format month names for the chart
  const getMonthName = (monthNum) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return months[monthNum - 1]
  }

  return (
    <div className="event-statistics">
      <h2>Event Statistics</h2>

      <div className="stats-grid">
        <div className="stats-card">
          <h3>Overview</h3>
          <div className="stats-overview">
            <div className="stat-item">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Events</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.upcoming}</div>
              <div className="stat-label">Upcoming Events</div>
            </div>
          </div>
        </div>

        <div className="stats-card">
          <h3>Events by Type</h3>
          <div className="stats-list">
            {stats.byType.map((item) => (
              <div key={item.event_type} className="stat-row">
                <div className="stat-name">{item.event_type}</div>
                <div className="stat-bar-container">
                  <div className="stat-bar" style={{ width: `${(item.count / stats.total) * 100}%` }}></div>
                </div>
                <div className="stat-count">{item.count}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="stats-card">
          <h3>Events by Month</h3>
          <div className="month-chart">
            {stats.byMonth.map((item) => (
              <div key={`${item.year}-${item.month}`} className="month-bar">
                <div
                  className="bar-fill"
                  style={{
                    height: `${(item.count / Math.max(...stats.byMonth.map((m) => m.count))) * 100}%`,
                  }}
                ></div>
                <div className="month-label">{getMonthName(item.month)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="stats-card">
          <h3>Events Needing Helpers</h3>
          {stats.needingHelpers.length > 0 ? (
            <div className="events-needing-helpers">
              {stats.needingHelpers.map((event) => (
                <div key={event.id} className="event-helper-need">
                  <div className="event-title">{event.title}</div>
                  <div className="event-date">{new Date(event.startDate).toLocaleDateString()}</div>
                  <div className="helper-count">
                    <span className="needed">{event.neededHelpers}</span> more helper
                    {event.neededHelpers !== 1 && "s"} needed
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-helpers-needed">All events have enough helpers</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EventStatistics
