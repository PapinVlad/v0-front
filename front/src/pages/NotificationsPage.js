"use client"

import { useState, useEffect } from "react";
import api from "../utils/api"; // Предполагается, что api настроен для аутентификации
import { getCurrentUser } from "../utils/auth";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { user } = await getCurrentUser(); // Получаем текущего пользователя
        const response = await api.get("/notifications", {
          params: { userId: user.id }, // Передаем userId
        });
        setNotifications(response.data.notifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setError("Failed to load notifications. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      const { user } = await getCurrentUser();
      await api.put(`/notifications/${notificationId}/read`, { userId: user.id });
      setNotifications(
        notifications.map((notification) =>
          notification.id === notificationId ? { ...notification, isRead: true } : notification
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
      setError("Failed to mark notification as read. Please try again.");
    }
  };

  const markAllAsRead = async () => {
    try {
      const { user } = await getCurrentUser();
      await api.put("/notifications/read/all", { userId: user.id });
      setNotifications(
        notifications.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );
    } catch (error) {
      console.error("Error marking all as read:", error);
      setError("Failed to mark all notifications as read. Please try again.");
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "all") return true;
    if (filter === "unread") return !notification.isRead;
    return notification.type === filter;
  });

  // Sort notifications by date (newest first)
  const sortedNotifications = [...filteredNotifications].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  if (loading) {
    return <div className="loading">Loading notifications...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="notifications-page">
      <h1>Notifications</h1>

      <div className="notifications-controls">
        <div className="filter-controls">
          <label htmlFor="filter">Filter: </label>
          <select
            id="filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Notifications</option>
            <option value="unread">Unread</option>
            <option value="badge">Badges</option>
            <option value="event">Events</option>
            <option value="message">Messages</option>
            <option value="helper">Helper Requests</option>
          </select>
        </div>

        <button
          className="mark-all-read-button"
          onClick={markAllAsRead}
          disabled={!notifications.some((n) => !n.isRead)}
        >
          Mark All as Read
        </button>
      </div>

      <div className="notifications-list">
        {sortedNotifications.length === 0 ? (
          <p>No notifications</p>
        ) : (
          sortedNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification ${!notification.isRead ? "unread" : ""}`}
              onClick={() => markAsRead(notification.id)}
            >
              <div className="notification-icon">
                {notification.type === "badge" && "🏆"}
                {notification.type === "event" && "📅"}
                {notification.type === "message" && "✉️"}
                {notification.type === "helper" && "🤝"}
              </div>

              <div className="notification-content">
                <div className="notification-header">
                  <h3 className="notification-title">{notification.title}</h3>
                  <span className="notification-time">
                    {new Date(notification.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="notification-message">{notification.message}</p>
              </div>

              {!notification.isRead && (
                <div className="notification-status">
                  <span className="unread-indicator"></span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;