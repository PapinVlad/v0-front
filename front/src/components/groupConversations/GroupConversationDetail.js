"use client"

// Обновим компонент для правильного отображения сообщений
import { useState, useEffect, useRef } from "react"
import { useParams, Link } from "react-router-dom"
import api from "../../utils/api"
import { getCurrentUser } from "../../utils/auth"
import "./GroupConversations.css"

const GroupConversationDetail = () => {
  const { id } = useParams()
  const [conversation, setConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sending, setSending] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const messagesEndRef = useRef(null)

  // Fetch conversation details and messages
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get current user
        const userData = await getCurrentUser()
        setCurrentUser(userData.user)

        // Get conversation details
        const conversationResponse = await api.get(`/group-conversations/${id}`)
        setConversation(conversationResponse.data.conversation)

        // Get messages
        const messagesResponse = await api.get(`/group-conversations/${id}/messages`)
        console.log("Fetched messages:", messagesResponse.data.messages)
        setMessages(messagesResponse.data.messages)

        setLoading(false)
      } catch (error) {
        console.error("Error fetching conversation data:", error)
        setError("Failed to load conversation. Please try again later.")
        setLoading(false)
      }
    }

    fetchData()

    // Set up polling for new messages
    const interval = setInterval(() => {
      if (!sending) {
        fetchNewMessages()
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [id])

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const fetchNewMessages = async () => {
    try {
      console.log(`Fetching messages for conversation ${id}`)

      const response = await api.get(`/group-conversations/${id}/messages`)
      console.log(`Retrieved ${response.data.messages.length} messages from server`)

      if (response.data.messages.length > messages.length) {
        console.log(`Updating messages: ${response.data.messages.length} > ${messages.length}`)
        setMessages(response.data.messages)
      }
    } catch (error) {
      console.error("Error fetching new messages:", error)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()

    if (!newMessage.trim()) {
      return
    }

    try {
      setSending(true)
      console.log(`Sending message to conversation ${id}: ${newMessage}`)

      const response = await api.post(`/group-conversations/${id}/messages`, {
        content: newMessage,
      })

      console.log(`Response from server:`, response.data)

      if (response.data.success && response.data.message) {
        // Add the new message to the list
        setMessages([...messages, response.data.message])
        setNewMessage("")
      } else {
        console.error("Invalid response format:", response.data)
        setError("Failed to send message. Invalid server response.")
      }

      setSending(false)
    } catch (error) {
      console.error("Error sending message:", error)
      setError("Failed to send message. Please try again later.")
      setSending(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading conversation...</div>
  }

  if (error) {
    return <div className="error">{error}</div>
  }

  if (!conversation) {
    return <div className="error">Conversation not found</div>
  }

  return (
    <div className="group-conversation-detail">
      <div className="conversation-header">
        <Link to="/group-conversations" className="back-button">
          &larr; Back to Conversations
        </Link>
        <h2>{conversation.name}</h2>
        <div className="conversation-meta">
          <span>{conversation.member_count} members</span>
        </div>
      </div>

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="no-messages">No messages yet. Start the conversation!</div>
        ) : (
          <div className="messages-list">
            {messages.map((message) => (
              <div
                key={message.message_id}
                className={`message ${currentUser && message.sender_id === currentUser.user_id ? "own-message" : ""}`}
              >
                <div className="message-header">
                  <span className="sender-name">{message.sender_name}</span>
                  <span className="message-time">{new Date(message.sent_at).toLocaleString()}</span>
                </div>
                <div className="message-content">{message.content}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <form className="message-form" onSubmit={handleSendMessage}>
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          disabled={sending}
        />
        <button type="submit" disabled={sending || !newMessage.trim()}>
          {sending ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  )
}

export default GroupConversationDetail
