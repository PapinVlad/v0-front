"use client"

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import { getCurrentUser } from "../../utils/auth";
import "./Notifications.css";

const NotificationBadge = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUnreadCounts = async () => {
      try {
        setLoading(true);
        const { user } = await getCurrentUser(); // Получаем текущего пользователя

        // Получить количество непрочитанных уведомлений с сервера
        const notificationResponse = await api.get("/notifications/unread/count", {
          params: { userId: user.id },
        });
        setUnreadCount(notificationResponse.data.count);

        // Получить количество непрочитанных сообщений (предполагается, что endpoint существует)
        const messageResponse = await api.get("/messages/unread/count", {
          params: { userId: user.id },
        });
        setUnreadMessages(messageResponse.data.count);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching unread counts:", error);
        setLoading(false);
      }
    };

    fetchUnreadCounts();

    // Set up polling to check for new notifications every minute
    const interval = setInterval(fetchUnreadCounts, 60000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return null;
  }

  const totalUnread = unreadCount + unreadMessages;

  if (totalUnread === 0) {
    return null;
  }

  return (
    <div className="notification-badge-container">
      {unreadCount > 0 && (
        <Link to="/notifications" className="notification-badge">
          <span className="badge-icon">🔔</span>
          <span className="badge-count">{unreadCount}</span>
        </Link>
      )}

      {unreadMessages > 0 && (
        <Link to="/messages/inbox" className="message-badge">
          <span className="badge-icon">✉️</span>
          <span className="badge-count">{unreadMessages}</span>
        </Link>
      )}
    </div>
  );
};

export default NotificationBadge;