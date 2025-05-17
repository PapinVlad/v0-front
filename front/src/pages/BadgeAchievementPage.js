"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { isAuthenticated, getUserRole } from "../utils/auth"
import BadgeAwardForm from "../components/BadgeAwardForm"
import BadgeAchievementStats from "../components/BadgeAchievementStats"
import api from "../utils/api"

const BadgeAchievementPage = () => {
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState("")
  const [userBadges, setUserBadges] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is authenticated and has leader role
    if (!isAuthenticated()) {
      navigate("/login")
      return
    }

    const userRole = getUserRole()
    if (userRole !== "admin" && userRole !== "leader") {
      navigate("/")
      return
    }

    // Fetch users
    const fetchUsers = async () => {
      try {
        const response = await api.get("/admin/users")
        // Filter out admin and leader users
        const filteredUsers = response.data.users.filter((user) => user.role !== "admin" && user.role !== "leader")
        setUsers(filteredUsers)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching users:", error)
        setError("Failed to load users. Please try again later.")
        setLoading(false)
      }
    }

    fetchUsers()
  }, [navigate])

  useEffect(() => {
    // Fetch user badges when a user is selected
    const fetchUserBadges = async () => {
      if (!selectedUser) {
        setUserBadges([])
        return
      }

      try {
        setLoading(true)
        const response = await api.get(`/achievements/user/${selectedUser}`)
        setUserBadges(response.data.badges)
      } catch (error) {
        console.error("Error fetching user badges:", error)
        setError("Failed to load user badges. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchUserBadges()
  }, [selectedUser, refreshTrigger])

  const handleUserChange = (e) => {
    setSelectedUser(e.target.value)
  }

  const handleAwardSuccess = () => {
    // Refresh user badges
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleRevokeBadge = async (badgeId) => {
    if (!window.confirm("Are you sure you want to revoke this badge?")) {
      return
    }

    try {
      await api.delete(`/achievements/${selectedUser}/${badgeId}`)
      // Refresh user badges
      setRefreshTrigger((prev) => prev + 1)
    } catch (error) {
      console.error("Error revoking badge:", error)
      setError("Failed to revoke badge. Please try again.")
    }
  }

  // Safely find the selected user data with null checks
  const selectedUserData =
    selectedUser && users && users.length > 0
      ? users.find((user) => user && user.id && user.id.toString() === selectedUser.toString())
      : null

  return (
    <div className="badge-achievement-page">
      <h1>Badge Achievement Management</h1>

      <div className="achievement-grid">
        <div className="achievement-section">
          <BadgeAwardForm onAwardSuccess={handleAwardSuccess} />

          <div className="user-badge-management">
            <h3>Manage User Badges</h3>

            <div className="form-group">
              <label htmlFor="user-select">Select User</label>
              <select id="user-select" value={selectedUser} onChange={handleUserChange}>
                <option value="" key="default-user-select">
                  -- Select a user --
                </option>
                {users &&
                  users.map((user) => (
                    <option key={`user-select-${user.id}`} value={user.id}>
                      {user.firstName} {user.lastName} ({user.username})
                    </option>
                  ))}
              </select>
            </div>

            {selectedUser && (
              <div className="selected-user-badges">
                <h4>
                  Badges for{" "}
                  {selectedUserData ? `${selectedUserData.firstName} ${selectedUserData.lastName}` : "Selected User"}
                </h4>

                {loading ? (
                  <div className="loading">Loading badges...</div>
                ) : userBadges.length === 0 ? (
                  <p>This user hasn't earned any badges yet.</p>
                ) : (
                  <div className="user-badges-list">
                    {userBadges.map((achievement) => (
                      <div key={achievement.id} className="user-badge-item">
                        <div className="badge-info">
                          <h5>{achievement.badge.name}</h5>
                          <span className="badge-category">{achievement.badge.category}</span>
                          <div className="badge-meta">
                            <span className="awarded-date">
                              Awarded: {new Date(achievement.awardedDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <button onClick={() => handleRevokeBadge(achievement.badgeId)} className="revoke-button">
                          Revoke
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="achievement-section">
          <BadgeAchievementStats />
        </div>
      </div>
    </div>
  )
}

export default BadgeAchievementPage
