"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import api from "../../utils/api"
import "./Messaging.css"

const MessageList = ({ type = "inbox" }) => {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true)
        const endpoint = type === "inbox" ? "/messages/inbox" : "/messages/sent"
        const response = await api.get(endpoint)
        setMessages(response.data.messages)
        setLoading(false)
      } catch (error) {
        console.error(`Error fetching ${type} messages:`, error)
        setError(`Failed to load ${type} messages. Please try again later.`)
        setLoading(false)
      }
    }

    fetchMessages()
  }, [type])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  if (loading) {
    return <div className="loading">Loading messages...</div>
  }

  if (error) {
    return <div className="error-message">{error}</div>
  }

  if (messages.length === 0) {
    return (
      <div className="no-messages">
        <p>No messages in your {type}.</p>
        {type === "inbox" && (
          <Link to="/messages/new" className="button">
            Compose New Message
          </Link>
        )}
      </div>
    )
  }

  return (
    <div className="message-list">
      <h2>{type === "inbox" ? "Inbox" : "Sent Messages"}</h2>

      {type === "inbox" && (
        <Link to="/messages/new" className="compose-button">
          Compose New Message
        </Link>
      )}

      <div className="message-items">
        {messages.map((message) => (
          <Link
            to={`/messages/${message.message_id}`}
            key={message.message_id}
            className={`message-item ${!message.is_read && type === "inbox" ? "unread" : ""}`}
          >
            <div className="message-header">
              <span className="message-from">
                {type === "inbox" ? `From: ${message.sender_name}` : `To: ${message.receiver_name}`}
              </span>
              <span className="message-date">{formatDate(message.sent_at)}</span>
            </div>
            <div className="message-subject">{message.subject || "(No subject)"}</div>
            <div className="message-preview">
              {message.content.length > 100 ? `${message.content.substring(0, 100)}...` : message.content}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default MessageList
