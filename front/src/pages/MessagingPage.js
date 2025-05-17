"use client"

import { useState, useEffect } from "react"

const MessagingPage = () => {
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate fetching conversations from API
    setTimeout(() => {
      const mockConversations = [
        {
          id: 1,
          with: {
            id: 2,
            name: "John Smith",
            role: "leader",
          },
          lastMessage: {
            text: "When is the next meeting?",
            timestamp: "2025-05-13T14:30:00",
            isRead: true,
          },
          messages: [
            {
              id: 1,
              sender: 2,
              text: "Hello, I wanted to ask about the upcoming event",
              timestamp: "2025-05-13T14:25:00",
              isRead: true,
            },
            {
              id: 2,
              sender: 1, // current user
              text: "Hi John, what would you like to know?",
              timestamp: "2025-05-13T14:28:00",
              isRead: true,
            },
            {
              id: 3,
              sender: 2,
              text: "When is the next meeting?",
              timestamp: "2025-05-13T14:30:00",
              isRead: true,
            },
          ],
        },
        {
          id: 2,
          with: {
            id: 3,
            name: "Sarah Johnson",
            role: "helper",
          },
          lastMessage: {
            text: "I can help with the badge day",
            timestamp: "2025-05-12T09:15:00",
            isRead: false,
          },
          messages: [
            {
              id: 4,
              sender: 1, // current user
              text: "Hi Sarah, we need helpers for the badge day next week",
              timestamp: "2025-05-12T09:10:00",
              isRead: true,
            },
            {
              id: 5,
              sender: 3,
              text: "I can help with the badge day",
              timestamp: "2025-05-12T09:15:00",
              isRead: false,
            },
          ],
        },
      ]

      setConversations(mockConversations)
      setLoading(false)
    }, 1000)
  }, [])

  const handleSendMessage = (e) => {
    e.preventDefault()

    if (!message.trim() || !selectedConversation) return

    // In a real app, you would send this to your API
    const newMessage = {
      id: Date.now(),
      sender: 1, // current user id
      text: message,
      timestamp: new Date().toISOString(),
      isRead: true,
    }

    // Update the conversation with the new message
    const updatedConversations = conversations.map((conv) => {
      if (conv.id === selectedConversation.id) {
        return {
          ...conv,
          messages: [...conv.messages, newMessage],
          lastMessage: {
            text: message,
            timestamp: new Date().toISOString(),
            isRead: true,
          },
        }
      }
      return conv
    })

    setConversations(updatedConversations)
    setMessage("")

    // Update the selected conversation
    const updatedSelectedConversation = updatedConversations.find((conv) => conv.id === selectedConversation.id)
    setSelectedConversation(updatedSelectedConversation)
  }

  if (loading) {
    return <div className="loading">Loading conversations...</div>
  }

  return (
    <div className="messaging-page">
      <h1>Messages</h1>

      <div className="messaging-container">
        <div className="conversation-list">
          <h2>Conversations</h2>
          {conversations.length === 0 ? (
            <p>No conversations yet</p>
          ) : (
            <ul className="message-list">
              {conversations.map((conversation) => (
                <li
                  key={conversation.id}
                  className={`message-item ${!conversation.lastMessage.isRead ? "unread" : ""} ${selectedConversation?.id === conversation.id ? "selected" : ""}`}
                  onClick={() => setSelectedConversation(conversation)}
                >
                  <div className="message-avatar">{conversation.with.name.charAt(0)}</div>
                  <div className="message-content">
                    <div className="message-header">
                      <span className="message-sender">{conversation.with.name}</span>
                      <span className="message-time">
                        {new Date(conversation.lastMessage.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="message-text">{conversation.lastMessage.text}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="conversation-detail">
          {selectedConversation ? (
            <>
              <div className="conversation-header">
                <h2>Chat with {selectedConversation.with.name}</h2>
                <span className="user-role">{selectedConversation.with.role}</span>
              </div>

              <div className="messages-container">
                {selectedConversation.messages.map((msg) => (
                  <div key={msg.id} className={`message ${msg.sender === 1 ? "sent" : "received"}`}>
                    <div className="message-bubble">{msg.text}</div>
                    <div className="message-time">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                ))}
              </div>

              <form className="compose-form" onSubmit={handleSendMessage}>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  rows="3"
                ></textarea>
                <button type="submit" className="send-button">
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className="no-conversation-selected">
              <p>Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MessagingPage
