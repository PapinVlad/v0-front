"use client"

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import { getCurrentUser } from "../../utils/auth";
import "./Notifications.css";

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const { user } = await getCurrentUser();
        const response = await api.get("/notifications", {
          params: { userId: user.id },
        });
        setNotifications(response.data.notifications || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setError("Failed to load notifications. Please try again later.");
        setLoading(false);
      }
    };

    fetchNotifications();

    // Set up polling to check for new notifications every minute
    const interval = setInterval(fetchNotifications, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    try {
      const { user } = await getCurrentUser();
      await api.put(`/notifications/${notificationId}/read`, { userId: user.id });
      setNotifications(
        notifications.map((notification) =>
          notification.notification_id === notificationId
            ? { ...notification, is_read: true, read_at: new Date().toISOString() }
            : notification
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
      setError("Failed to mark notification as read. Please try again.");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const { user } = await getCurrentUser();
      await api.put("/notifications/read/all", { userId: user.id });
      setNotifications(
        notifications.map((notification) => ({
          ...notification,
          is_read: true,
          read_at: new Date().toISOString(),
        }))
      );
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      setError("Failed to mark all notifications as read. Please try again.");
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      const { user } = await getCurrentUser();
      await api.delete(`/notifications/${notificationId}`, { data: { userId: user.id } });
      setNotifications(
        notifications.filter((notification) => notification.notification_id !== notificationId)
      );
    } catch (error) {
      console.error("Error deleting notification:", error);
      setError("Failed to delete notification. Please try again.");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getNotificationLink = (notification) => {
    switch (notification.notification_type) {
      case "message":
        return `/messages/${notification.reference_id}`;
      case "announcement":
        return `/announcements/${notification.reference_id}`;
      case "event":
        return `/events/${notification.reference_id}`;
      case "badge":
        return `/badges/${notification.reference_id}`;
      case "group_conversation":
        return `/group-conversations/${notification.reference_id}`;
      default:
        return null;
    }
  };

  if (loading) {
    return <div className="loading">Loading notifications...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (notifications.length === 0) {
    return <div className="no-notifications">No notifications available.</div>;
  }

  const unreadCount = notifications.filter((notification) => !notification.is_read).length;

  return (
    <div className="notification-list">
      <div className="notification-header">
        <h2>Notifications</h2>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllAsRead} className="mark-all-read-button">
            Mark All as Read
          </button>
        )}
      </div>

      {notifications
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .map((notification) => {
          const link = getNotificationLink(notification);

          const NotificationContent = () => (
            <>
              <div className="notification-title">{notification.title}</div>
              <div className="notification-content">{notification.content}</div>
              <div className="notification-date">{formatDate(notification.created_at)}</div>
            </>
          );

          return (
            <div
              key={notification.notification_id}
              className={`notification-item ${!notification.is_read ? "unread" : ""}`}
            >
              {link ? (
                <Link
                  to={link}
                  className="notification-link"
                  onClick={() => {
                    if (!notification.is_read) {
                      handleMarkAsRead(notification.notification_id);
                    }
                  }}
                >
                  <NotificationContent />
                </Link>
              ) : (
                <div className="notification-content-wrapper">
                  <NotificationContent />
                </div>
              )}

              <div className="notification-actions">
                {!notification.is_read && (
                  <button
                    onClick={() => handleMarkAsRead(notification.notification_id)}
                    className="mark-read-button"
                  >
                    Mark as Read
                  </button>
                )}
                <button
                  onClick={() => handleDelete(notification.notification_id)}
                  className="delete-button"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default NotificationList;