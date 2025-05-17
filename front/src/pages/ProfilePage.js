"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getCurrentUser, isAuthenticated } from "../utils/auth"
import UserBadges from "../components/UserBadges"

const ProfilePage = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!isAuthenticated()) {
        navigate("/login")
        return
      }

      try {
        const { user } = await getCurrentUser()
        setUser(user)
      } catch (error) {
        console.error("Error fetching user profile:", error)
        setError("Failed to load profile. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [navigate])

  if (loading) {
    return (
      <div className="profile-page">
        <div className="loading">Loading profile...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="profile-page">
        <div className="error-message">{error}</div>
        <button onClick={() => navigate("/login")}>Back to Login</button>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="profile-page">
        <div className="error-message">User not found. Please login again.</div>
        <button onClick={() => navigate("/login")}>Back to Login</button>
      </div>
    )
  }

  return (
    <div className="profile-page">
      <h1>My Profile</h1>

      <div className="profile-card">
        <div className="profile-header">
          <h2>
            {user.firstName} {user.lastName}
          </h2>
          <span className="role-badge">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>
        </div>

        <div className="profile-details">
          <div className="detail-item">
            <span className="detail-label">Username:</span>
            <span className="detail-value">{user.username}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Email:</span>
            <span className="detail-value">{user.email}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Member Since:</span>
            <span className="detail-value">
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Last Login:</span>
            <span className="detail-value">{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "N/A"}</span>
          </div>
        </div>

        {/* User Badges Section */}
        <UserBadges userId={user.id} isCurrentUser={true} />

        {/* Role-specific content */}
        {user.role === "leader" && (
          <div className="role-specific-content">
            <h3>Leader Dashboard</h3>
            <p>As a leader, you have access to:</p>
            <ul>
              <li>Manage all helpers and their schedules</li>
              <li>Create and edit events</li>
              <li>Upload photos and manage the gallery</li>
              <li>View and update badge information</li>
              <li>Access training materials</li>
            </ul>
            <div className="action-buttons">
              <button onClick={() => navigate("/leader")}>Go to Leader Dashboard</button>
              <button onClick={() => navigate("/admin")}>Go to Admin Dashboard</button>
            </div>
          </div>
        )}

        {user.role === "helper" && (
          <div className="role-specific-content">
            <h3>Helper Dashboard</h3>
            <p>As a helper, you have access to:</p>
            <ul>
              <li>View your helper schedule</li>
              <li>Update your availability</li>
              <li>View upcoming events</li>
              <li>Access training materials</li>
            </ul>
            <div className="action-buttons">
              <button onClick={() => navigate("/helper")}>Go to Helper Dashboard</button>
            </div>
          </div>
        )}

        {user.role === "public" && (
          <div className="role-specific-content">
            <h3>Member Information</h3>
            <p>As a member, you have access to:</p>
            <ul>
              <li>View badge information</li>
              <li>Browse the photo gallery</li>
              <li>Play interactive games</li>
              <li>Learn about Cub Scouts</li>
            </ul>
            <div className="action-buttons">
              <button onClick={() => navigate("/badges")}>Explore Badges</button>
            </div>
          </div>
        )}
      </div>

      <div className="profile-actions">
        <button className="edit-profile-btn">Edit Profile</button>
        <button className="change-password-btn">Change Password</button>
      </div>
    </div>
  )
}

export default ProfilePage