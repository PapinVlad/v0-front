"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import { getUserRole } from "../utils/auth";

const GroupConversationsPage = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userRole = getUserRole();
  const canCreateGroup = userRole === "admin" || userRole === "leader";

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get("/group-conversations"); // Убираем лишний /api
        setGroups(response.data.conversations || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching groups:", error);
        setError("Failed to load conversations. Please try again later.");
        setGroups([]);
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!message.trim() || !selectedGroup) return;

    try {
      const response = await api.post(`/group-conversations/${selectedGroup.conversation_id}/messages`, {
        content: message,
      });
      if (response.data.success && response.data.message) {
        setGroups((prevGroups) =>
          prevGroups.map((group) =>
            group.conversation_id === selectedGroup.conversation_id
              ? { ...group, messages: [...group.messages, response.data.message] }
              : group
          )
        );
        setMessage("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message. Please try again.");
    }
  };

  const handleAddMember = async (memberId) => {
    if (!memberId || !selectedGroup) return;

    try {
      await api.post(`/group-conversations/${selectedGroup.conversation_id}/members`, {
        memberId: parseInt(memberId),
      });
      const response = await api.get(`/group-conversations/${selectedGroup.conversation_id}`);
      setGroups((prevGroups) =>
        prevGroups.map((group) =>
          group.conversation_id === selectedGroup.conversation_id ? response.data.conversation : group
        )
      );
      setSelectedGroup(response.data.conversation);
    } catch (error) {
      console.error("Error adding member:", error);
      setError("Failed to add member. Please try again.");
    }
  };

  if (loading) {
    return <div className="loading">Loading group conversations...</div>;
  }

  return (
    <div className="group-conversations-page">
      <h1>Group Conversations</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="group-conversations-container">
        <div className="group-list">
          <div className="group-list-header">
            <h2>Your Groups</h2>
            {canCreateGroup && (
              <Link to="/group-conversations/new" className="create-button">
                Create Group
              </Link>
            )}
          </div>

          {groups.length === 0 ? (
            <p>No group conversations available</p>
          ) : (
            <ul className="groups">
              {groups.map((group) => (
                <li
                  key={group.conversation_id}
                  className={`group-item ${selectedGroup?.conversation_id === group.conversation_id ? "selected" : ""}`}
                  onClick={() => setSelectedGroup(group)}
                >
                  <div className="group-item-name">{group.name}</div>
                  <div className="group-item-members">{group.member_count} members</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="group-detail">
          {selectedGroup ? (
            <>
              <div className="group-header">
                <div>
                  <h2>{selectedGroup.name}</h2>
                  <p className="group-description">{selectedGroup.description || "No description"}</p>
                </div>
                <div className="group-members-count">{selectedGroup.member_count} members</div>
              </div>

              {(userRole === "admin" || userRole === "leader") && (
                <div>
                  <button
                    onClick={async () => {
                      const memberId = prompt("Enter member ID to add:");
                      if (memberId) {
                        await handleAddMember(memberId);
                      }
                    }}
                  >
                    Add Member
                  </button>
                </div>
              )}

              <div className="group-messages">
                {selectedGroup.messages && selectedGroup.messages.length > 0 ? (
                  selectedGroup.messages.map((msg) => (
                    <div key={msg.message_id} className="group-message">
                      <div className="message-sender">{msg.sender_name}</div>
                      <div className="message-content">
                        <div className="message-text">{msg.content}</div>
                        <div className="message-time">{new Date(msg.sent_at).toLocaleString()}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No messages yet. Start the conversation!</p>
                )}
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
            <div className="no-group-selected">
              <p>Select a group conversation to view messages</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupConversationsPage;