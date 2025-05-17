"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import api from "../../utils/api"
import "./Messaging.css"

const MessageDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [replyContent, setReplyContent] = useState("")
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [sending, setSending] = useState(false)
  const [thread, setThread] = useState([])
  const [showThread, setShowThread] = useState(false)

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        setLoading(true)
        const response = await api.get(`/messages/${id}`)
        setMessage(response.data.message)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching message:", error)
        setError("Failed to load message. Please try again later.")
        setLoading(false)
      }
    }

    fetchMessage()
  }, [id])

  const fetchThread = async () => {
    try {
      const response = await api.get(`/messages/${id}/thread`)
      setThread(response.data.thread)
      setShowThread(true)
    } catch (error) {
      console.error("Error fetching message thread:", error)
      setError("Failed to load message thread. Please try again later.")
    }
  }

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      try {
        await api.delete(`/messages/${id}`)
        navigate("/messages/inbox")
      } catch (error) {
        console.error("Error deleting message:", error)
        setError("Failed to delete message. Please try again later.")
      }
    }
  }

  const handleReply = async (e) => {
    e.preventDefault()

    if (!replyContent.trim()) {
      return
    }

    try {
      setSending(true)
      await api.post("/messages", {
        receiverId: message.sender_id,
        subject: `Re: ${message.subject || "(No subject)"}`,
        content: replyContent,
        parentMessageId: message.message_id,
      })

      setReplyContent("")
      setShowReplyForm(false)
      setSending(false)

      // Refresh thread if it's open
      if (showThread) {
        fetchThread()
      }
    } catch (error) {
      console.error("Error sending reply:", error)
      setError("Failed to send reply. Please try again later.")
      setSending(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  if (loading) {
    return <div className="loading">Loading message...</div>
  }

  if (error) {
    return <div className="error-message">{error}</div>
  }

  if (!message) {
    return <div className="error-message">Message not found</div>
  }

  return (
    <div className="message-detail">
      <div className="message-actions">
        <Link to="/messages/inbox" className="back-button">
          Back to Inbox
        </Link>
        <button onClick={handleDelete} className="delete-button">
          Delete
        </button>
      </div>

      <div className="message-container">
        <div className="message-header">
          <h2>{message.subject || "(No subject)"}</h2>
          <div className="message-meta">
            <div>
              <strong>From:</strong> {message.sender_name} ({message.sender_username})
            </div>
            <div>
              <strong>To:</strong> {message.receiver_name} ({message.receiver_username})
            </div>
            <div>
              <strong>Date:</strong> {formatDate(message.sent_at)}
            </div>
          </div>
        </div>

        <div className="message-body">
          {message.content.split("\n").map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        <div className="message-actions">
          <button onClick={() => setShowReplyForm(!showReplyForm)} className="reply-button">
            {showReplyForm ? "Cancel Reply" : "Reply"}
          </button>

          {!showThread && message.parent_message_id && (
            <button onClick={fetchThread} className="thread-button">
              View Conversation
            </button>
          )}
        </div>

        {showReplyForm && (
          <form onSubmit={handleReply} className="reply-form">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write your reply here..."
              required
            />
            <button type="submit" disabled={sending}>
              {sending ? "Sending..." : "Send Reply"}
            </button>
          </form>
        )}

        {showThread && thread.length > 0 && (
          <div className="message-thread">
            <h3>Conversation</h3>
            {thread.map((msg) => (
              <div
                key={msg.message_id}
                className={`thread-message ${msg.message_id === Number.parseInt(id) ? "current" : ""}`}
              >
                <div className="thread-header">
                  <span className="thread-from">From: {msg.sender_name}</span>
                  <span className="thread-date">{formatDate(msg.sent_at)}</span>
                </div>
                <div className="thread-content">
                  {msg.content.split("\n").map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MessageDetail
