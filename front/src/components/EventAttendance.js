"use client"

import { useState, useEffect } from "react"
import api from "../utils/api"

const EventAttendance = ({ eventId }) => {
  const [event, setEvent] = useState(null)
  const [participants, setParticipants] = useState([])
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Get event details
        const eventResponse = await api.get(`/events/${eventId}`)
        setEvent(eventResponse.data.event)

        // Get participants
        if (eventResponse.data.event.participants) {
          setParticipants(eventResponse.data.event.participants)
        }

        // Get attendance records
        const attendanceResponse = await api.get(`/events/${eventId}/attendance`)
        setAttendance(attendanceResponse.data.attendance)
      } catch (error) {
        console.error("Error fetching attendance data:", error)
        setError("Failed to load attendance data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [eventId])

  const handleCheckIn = async (userId) => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      await api.post("/events/attendance", {
        eventId,
        userId,
        checkInTime: new Date(),
      })

      // Refresh attendance data
      const attendanceResponse = await api.get(`/events/${eventId}/attendance`)
      setAttendance(attendanceResponse.data.attendance)

      setSuccess("Check-in recorded successfully")
    } catch (error) {
      console.error("Error recording check-in:", error)
      setError(error.response?.data?.message || "Failed to record check-in")
    } finally {
      setLoading(false)
    }
  }

  const handleCheckOut = async (userId) => {
  try {
    setLoading(true);
    setError(null);
    setSuccess(null);

    await api.put(`/events/${eventId}/attendance`, {
      userId,
      checkOutTime: new Date(),
    });

    // Refresh attendance data
    const attendanceResponse = await api.get(`/events/${eventId}/attendance`);
    setAttendance(attendanceResponse.data.attendance);

    setSuccess("Check-out recorded successfully");
  } catch (error) {
    console.error("Error recording check-out:", error);
    setError(error.response?.data?.message || "Failed to record check-out");
  } finally {
    setLoading(false);
  }
};

  if (loading && !event) {
    return <div className="loading">Loading attendance data...</div>
  }

  if (error && !event) {
    return <div className="error-message">{error}</div>
  }

  if (!event) {
    return <div className="error-message">Event not found</div>
  }

  // Check if a user has checked in
  const isCheckedIn = (userId) => {
    return attendance.some((record) => record.userId === userId && record.checkInTime)
  }

  // Check if a user has checked out
  const isCheckedOut = (userId) => {
    return attendance.some((record) => record.userId === userId && record.checkOutTime)
  }

  // Get attendance record for a user
  const getAttendanceRecord = (userId) => {
    return attendance.find((record) => record.userId === userId)
  }

  // Format date and time
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return ""
    const date = new Date(dateTimeString)
    return date.toLocaleString()
  }

  return (
    <div className="event-attendance">
      <h2>Attendance for {event.title}</h2>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="attendance-stats">
        <div className="stat-item">
          <div className="stat-value">{participants.length}</div>
          <div className="stat-label">Registered</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{attendance.filter((record) => record.checkInTime).length}</div>
          <div className="stat-label">Checked In</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">
            {participants.length - attendance.filter((record) => record.checkInTime).length}
          </div>
          <div className="stat-label">No-Shows</div>
        </div>
      </div>

      <div className="attendance-list">
        <h3>Participants</h3>

        {participants.length === 0 ? (
          <div className="no-participants">No participants registered for this event</div>
        ) : (
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Check-In</th>
                <th>Check-Out</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {participants.map((participant) => {
                const checkedIn = isCheckedIn(participant.userId)
                const checkedOut = isCheckedOut(participant.userId)
                const record = getAttendanceRecord(participant.userId)

                return (
                  <tr key={participant.id} className={checkedIn ? "checked-in" : ""}>
                    <td>
                      {participant.firstName} {participant.lastName}
                    </td>
                    <td>
                      <span className={`status-badge ${participant.status}`}>
                        {participant.status.charAt(0).toUpperCase() + participant.status.slice(1)}
                      </span>
                    </td>
                    <td>{record && record.checkInTime ? formatDateTime(record.checkInTime) : "Not checked in"}</td>
                    <td>{record && record.checkOutTime ? formatDateTime(record.checkOutTime) : "Not checked out"}</td>
                    <td>
                      {!checkedIn ? (
                        <button
                          onClick={() => handleCheckIn(participant.userId)}
                          disabled={loading}
                          className="check-in-button"
                        >
                          Check In
                        </button>
                      ) : !checkedOut ? (
                        <button
                          onClick={() => handleCheckOut(participant.userId)}
                          disabled={loading}
                          className="check-out-button"
                        >
                          Check Out
                        </button>
                      ) : (
                        <span className="completed-text">Completed</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default EventAttendance
