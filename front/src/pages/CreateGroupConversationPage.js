"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import "../components/groupConversations/GroupConversations.css";

const CreateGroupConversationPage = () => {
  const [conversationName, setConversationName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!conversationName.trim()) {
    setError("Название беседы обязательно");
    return;
  }

  try {
    setCreating(true);
    setError(null);

    const response = await api.post("/group-conversations", {
      name: conversationName,
    });

    // Обновляем список групп через событие или перезагрузку
    window.dispatchEvent(new Event("groupCreated")); // Событие для обновления

    navigate(`/group-conversations/${response.data.conversationId}`);
  } catch (error) {
    console.error("Error creating conversation:", error.response?.data || error);
    setError(
      error.response?.data?.message ||
      "Не удалось создать беседу. Пожалуйста, попробуйте позже."
    );
    setCreating(false);
  }
};

  const handleCancel = () => {
    navigate("/group-conversations");
  };

  return (
    <div className="create-conversation-page">
      <h1>Создание новой групповой беседы</h1>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="conversation-form">
        <div className="form-group">
          <label htmlFor="conversationName">Название беседы *</label>
          <input
            type="text"
            id="conversationName"
            value={conversationName}
            onChange={(e) => setConversationName(e.target.value)}
            placeholder="Введите название беседы"
            required
          />
        </div>

        <div className="form-actions">
          <button type="button" onClick={handleCancel} className="cancel-button">
            Отмена
          </button>
          <button type="submit" disabled={creating} className="submit-button">
            {creating ? "Создание..." : "Создать беседу"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateGroupConversationPage;