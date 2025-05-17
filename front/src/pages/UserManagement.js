"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { isAuthenticated, getUserRole } from "../utils/auth"
import api from "../utils/api"

const UserManagement = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState("")
  const navigate = useNavigate()
  const [success, setSuccess] = useState(null)

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

    // Fetch users
    const fetchUsers = async () => {
      try {
        const response = await api.get("/admin/users")
        setUsers(response.data.users)
      } catch (error) {
        console.error("Error fetching users:", error)
        setError("Failed to load users")
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [navigate])

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put("/admin/users/role", { userId, role: newRole })

      // Update user in state
      setUsers(users.map((user) => (user.id === userId ? { ...user, role: newRole } : user)))
    } catch (error) {
      console.error("Error updating user role:", error)
      setError("Failed to update user role")
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Вы уверены, что хотите удалить этого пользователя?")) {
      return
    }

    try {
      await api.delete(`/admin/users/${userId}`)
      setUsers(users.filter((user) => user.id !== userId))
      setSuccess("Пользователь успешно удален")
    } catch (error) {
      console.error("Error deleting user:", error)
      setError("Failed to delete user. Please try again later.")
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = selectedRole === "" || user.role === selectedRole

    return matchesSearch && matchesRole
  })

  if (loading) {
    return (
      <div className="user-management">
        <h1>User Management</h1>
        <div className="loading">Loading users...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="user-management">
        <h1>User Management</h1>
        <div className="error-message">{error}</div>
      </div>
    )
  }

  return (
    <div className="user-management">
      <h1>User Management</h1>

      <div className="management-actions">
        <button onClick={() => navigate("/admin")} className="secondary-button">
          Back to Dashboard
        </button>
      </div>

      <div className="filter-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="role-filter">
          <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="leader">Leader</option>
            <option value="helper">Helper</option>
            <option value="public">Public</option>
          </select>
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="no-results">No users found matching your criteria</div>
      ) : (
        <div className="users-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    {user.firstName} {user.lastName}
                  </td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge ${user.role}`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"}</td>
                  <td>
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="role-select"
                    >
                      <option value="admin">Admin</option>
                      <option value="leader">Leader</option>
                      <option value="helper">Helper</option>
                      <option value="public">Public</option>
                    </select>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="btn btn-sm btn-danger ml-2"
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default UserManagement
