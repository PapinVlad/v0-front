"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { isAuthenticated, getUserRole } from "../utils/auth"
import api from "../utils/api"

const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is authenticated and has admin role
    if (!isAuthenticated()) {
      navigate("/login")
      return
    }

    const userRole = getUserRole()
    if (userRole !== "admin" && userRole !== "leader") {
      navigate("/")
      return
    }

    // Fetch dashboard stats
    const fetchStats = async () => {
      try {
        const response = await api.get("/admin/dashboard")
        setStats(response.data.stats)
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
        setError("Failed to load dashboard stats")
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [navigate])

  if (loading) {
    return (
      <div className="admin-dashboard">
        <h1>Admin Dashboard</h1>
        <div className="loading">Loading dashboard stats...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <h1>Admin Dashboard</h1>
        <div className="error-message">{error}</div>
      </div>
    )
  }

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h2>User Statistics</h2>
          <div className="stat-grid">
            <div className="stat-item">
              <span className="stat-label">Total Users</span>
              <span className="stat-value">{stats.users.total}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Leaders</span>
              <span className="stat-value">{stats.users.leaders}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Helpers</span>
              <span className="stat-value">{stats.users.helpers}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Public Users</span>
              <span className="stat-value">{stats.users.public}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Admins</span>
              <span className="stat-value">{stats.users.admin}</span>
            </div>
          </div>
          <div className="card-actions">
            <button onClick={() => navigate("/admin/users")}>Manage Users</button>
          </div>
        </div>

        <div className="dashboard-card">
          <h2>Badge Statistics</h2>
          <div className="stat-grid">
            <div className="stat-item">
              <span className="stat-label">Total Badges</span>
              <span className="stat-value">{stats.badges.total}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Categories</span>
              <span className="stat-value">{stats.badges.categories}</span>
            </div>
          </div>
          <h3>Badges by Category</h3>
          <ul className="category-list">
            {Object.entries(stats.badges.byCategory).map(([category, count]) => (
              <li key={category}>
                <span className="category-name">{category}</span>
                <span className="category-count">{count}</span>
              </li>
            ))}
          </ul>
          <div className="card-actions">
            <button onClick={() => navigate("/admin/badges")}>Manage Badges</button>
          </div>
        </div>
      </div>

      <div className="admin-actions">
        <button onClick={() => navigate("/admin/badges/new")} className="primary-button">
          Create New Badge
        </button>
        <button onClick={() => navigate("/admin/users")} className="secondary-button">
          Manage Users
        </button>
      </div>
    </div>
  )
}

export default AdminDashboard
