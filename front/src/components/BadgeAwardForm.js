"use client"

import { useState, useEffect } from "react"
import api from "../utils/api"

const BadgeAwardForm = ({ onAwardSuccess }) => {
  const [users, setUsers] = useState([])
  const [badges, setBadges] = useState([])
  const [selectedUser, setSelectedUser] = useState("")
  const [selectedBadge, setSelectedBadge] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
  try {
    const [usersResponse, badgesResponse] = await Promise.all([
      api.get("/admin/users"),
      api.get("/badges"),
    ]);
    console.log("Raw users response:", usersResponse.data.users);

    const filteredUsers = usersResponse.data.users.filter(
      (user) => user.role !== "admin" && user.role !== "leader"
    );
    console.log("Filtered users:", filteredUsers);

    if (filteredUsers.length === 0) {
      setError("No eligible users found (excluding admins and leaders).");
    } else {
      const validUsers = filteredUsers.filter((user) => user.id != null && !isNaN(Number(user.id)));
      if (validUsers.length !== filteredUsers.length) {
        console.warn("Some users have invalid IDs:", filteredUsers);
      }
      setUsers(validUsers);
    }
    setBadges(badgesResponse.data.badges);
  } catch (error) {
    console.error("Error fetching data:", error);
    setError("Failed to load users and badges. Please try again later.");
  } finally {
    setLoading(false);
  }
};

    fetchData()
  }, [])

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!selectedUser || !selectedBadge) {
    setError("Please select both a user and a badge");
    return;
  }

  setSubmitting(true);
  setError(null);

  try {
    console.log("Submitting award:", { userId: selectedUser, badgeId: selectedBadge, notes });
    const userIdAsNumber = Number(selectedUser); // Преобразуем в число
    if (isNaN(userIdAsNumber)) {
      throw new Error("Invalid user ID");
    }
    const response = await api.post("/achievements", {
      userId: userIdAsNumber,
      badgeId: selectedBadge,
      notes,
    });
    console.log("Award response:", response.data);

    setSuccess(true);
    setSelectedUser("");
    setSelectedBadge("");
    setNotes("");

    if (onAwardSuccess) {
      onAwardSuccess();
    }

    setTimeout(() => {
      setSuccess(false);
    }, 3000);
  } catch (error) {
    console.error("Error awarding badge:", error);
    setError(error.response?.data?.message || "Failed to award badge. Please try again.");
  } finally {
    setSubmitting(false);
  }
};

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="badge-award-form">
      <h3>Award Badge</h3>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">Badge awarded successfully!</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="user">Select User</label>
          <select
  id="user"
  value={selectedUser}
  onChange={(e) => setSelectedUser(e.target.value)}
  required
  disabled={users.length === 0}
>
  <option value="" key="default-user">
    -- Select a user --
  </option>
  {users.length === 0 && (
    <option value="" disabled>
      No eligible users found
    </option>
  )}
  {users.map((user) => (
    <option key={`user-${user.id}`} value={user.id}>
      {user.firstName} {user.lastName} ({user.username}) - ID: {user.id}
    </option>
  ))}
</select>
        </div>

        <div className="form-group">
          <label htmlFor="badge">Select Badge</label>
          <select id="badge" value={selectedBadge} onChange={(e) => setSelectedBadge(e.target.value)} required>
            <option value="" key="default-badge">
              -- Select a badge --
            </option>
            {badges &&
              badges.map((badge) => (
                <option key={`badge-${badge.id}`} value={badge.id}>
                  {badge.name} ({badge.category})
                </option>
              ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="notes">Notes (Optional)</label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows="3"
            placeholder="Add any notes about how the badge was earned"
          ></textarea>
        </div>

        <button type="submit" disabled={submitting} className="award-button">
          {submitting ? "Awarding..." : "Award Badge"}
        </button>
      </form>
    </div>
  )
}

export default BadgeAwardForm
