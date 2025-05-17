"use client"

import { useState, useEffect, useCallback } from "react"
import api from "../utils/api"

const EventFilter = ({ onFilterChange }) => {
  const [eventTypes, setEventTypes] = useState([])
  const [selectedType, setSelectedType] = useState("")
  const [showUpcoming, setShowUpcoming] = useState(true)
  const [showPast, setShowPast] = useState(false)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)

  // Fetch event types only once when component mounts
  useEffect(() => {
    const controller = new AbortController()

    const fetchEventTypes = async () => {
      try {
        setLoading(true)
        const response = await api.get("/events", {
          signal: controller.signal,
        })

        // Extract unique event types
        if (response.data && Array.isArray(response.data.events)) {
          const types = [...new Set(response.data.events.map((event) => event.eventType))].filter(Boolean)
          setEventTypes(types)
        }
      } catch (error) {
        if (error.name !== "CanceledError") {
          console.error("Error fetching event types:", error)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchEventTypes()

    return () => {
      controller.abort()
    }
  }, [])

  // Memoize the applyFilters function to prevent it from changing on every render
  const applyFilters = useCallback(() => {
    const filters = {
      upcoming: showUpcoming,
      past: showPast,
      eventType: selectedType,
      startDate,
      endDate,
    }
    onFilterChange(filters)
  }, [showUpcoming, showPast, selectedType, startDate, endDate, onFilterChange])

  // Apply filters when they change, but only after initialization
  useEffect(() => {
    if (!initialized) {
      setInitialized(true)
      return
    }
    applyFilters()
  }, [initialized, applyFilters])

  const handleClearFilters = () => {
    setSelectedType("")
    setShowUpcoming(true)
    setShowPast(false)
    setStartDate("")
    setEndDate("")
  }

  return (
    <div className="event-filter">
      <div className="filter-section">
        <div className="filter-group">
          <label>Event Type</label>
          <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
            <option value="">All Types</option>
            {eventTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Date Range</label>
          <div className="date-inputs">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Start Date"
            />
            <span>to</span>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} placeholder="End Date" />
          </div>
        </div>

        <div className="filter-group">
          <label>Show Events</label>
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input type="checkbox" checked={showUpcoming} onChange={(e) => setShowUpcoming(e.target.checked)} />
              Upcoming
            </label>
            <label className="checkbox-label">
              <input type="checkbox" checked={showPast} onChange={(e) => setShowPast(e.target.checked)} />
              Past
            </label>
          </div>
        </div>

        <button onClick={handleClearFilters} className="clear-filters-button">
          Clear Filters
        </button>
      </div>
    </div>
  )
}

export default EventFilter
