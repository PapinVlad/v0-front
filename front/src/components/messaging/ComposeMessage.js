"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../utils/api"
import "./Messaging.css"

const ComposeMessage = () => {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    receiverId: "",
    subject: "",
    content: "",
  })
  const [sending, setSending] = useState(false)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const response = await api.get("/admin/users")
        setUsers(response.data.users)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching users:", error)
        setError("Failed to load users. Please try again later.")
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.receiverId || !formData.content) {
      setError("Recipient and message content are required")
      return
    }

    try {
      setSending(true)
      await api.post("/messages", formData)
      navigate("/messages/inbox")
    } catch (error) {
      console.error("Error sending message:", error)
      setError("Failed to send message. Please try again later.")
      setSending(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="compose-message">
      <h2>Compose New Message</h2>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="receiverId">To:</label>
          <select id="receiverId" name="receiverId" value={formData.receiverId} onChange={handleChange} required>
            <option value="">Select recipient</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.firstName} {user.lastName} ({user.username}) - {user.role}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="subject">Subject:</label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="(Optional)"
          />
        </div>

        <div className="form-group">
          <label htmlFor="content">Message:</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Write your message here..."
            required
          />
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate("/messages/inbox")} className="cancel-button">
            Cancel
          </button>
          <button type="submit" disabled={sending} className="send-button">
            {sending ? "Sending..." : "Send Message"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ComposeMessage
