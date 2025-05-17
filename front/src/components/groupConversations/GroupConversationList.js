"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import api from "../../utils/api"
import "./GroupConversations.css"
import { getUserRole } from "../../utils/auth"

const GroupConversationList = () => {
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [newConversationName, setNewConversationName] = useState("")
  const [creating, setCreating] = useState(false)
  const [userRole, setUserRole] = useState(null)

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true)
        const response = await api.get("/group-conversations")
        setConversations(response.data.conversations)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching group conversations:", error)
        setError("Failed to load conversations. Please try again later.")
        setLoading(false)
      }
    }

    fetchConversations()
  }, [])

  useEffect(() => {
    setUserRole(getUserRole())
  }, [])

  const handleCreateConversation = async (e) => {
    e.preventDefault()

    if (!newConversationName.trim()) {
      return
    }

    try {
      setCreating(true)
      const response = await api.post("/group-conversations", {
        name: newConversationName,
      })

      setConversations([response.data.conversation, ...conversations])
      setNewConversationName("")
      setShowNewForm(false)
      setCreating(false)
    } catch (error) {
      console.error("Error creating conversation:", error)
      setError("Failed to create conversation. Please try again later.")
      setCreating(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "No activity yet"
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  if (loading) {
    return <div className="loading">Loading conversations...</div>
  }

  return (
    <div className="group-conversation-list">
      <div className="conversation-header">
        <h2>Group Conversations</h2>
        {(userRole === "admin" || userRole === "leader") && (
          <button onClick={() => setShowNewForm(!showNewForm)} className="new-conversation-button">
            {showNewForm ? "Cancel" : "New Conversation"}
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {showNewForm && (userRole === "admin" || userRole === "leader") && (
        <form onSubmit={handleCreateConversation} className="new-conversation-form">
          <input
            type="text"
            value={newConversationName}
            onChange={(e) => setNewConversationName(e.target.value)}
            placeholder="Conversation name"
            required
          />
          <button type="submit" disabled={creating}>
            {creating ? "Creating..." : "Create"}
          </button>
        </form>
      )}

      {conversations.length === 0 ? (
        <div className="no-conversations">
          <p>You are not part of any group conversations yet.</p>
          {(userRole === "admin" || userRole === "leader") && (
            <button onClick={() => setShowNewForm(true)} className="start-conversation-button">
              Start a New Conversation
            </button>
          )}
        </div>
      ) : (
        <div className="conversation-items">
          {conversations.map((conversation) => (
            <Link
              to={`/group-conversations/${conversation.conversation_id}`}
              key={conversation.conversation_id}
              className={`conversation-item ${conversation.unread_count > 0 ? "unread" : ""}`}
            >
              <div className="conversation-name">
                {conversation.name}
                {conversation.unread_count > 0 && <span className="unread-badge">{conversation.unread_count}</span>}
              </div>
              <div className="conversation-meta">
                <span className="member-count">{conversation.member_count} members</span>
                <span className="last-activity">Last activity: {formatDate(conversation.last_activity)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default GroupConversationList
