"use client"
import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { isAuthenticated, getUserRole, logout, getCurrentUser } from "../utils/auth"

const Navigation = ({ user: propUser }) => {
  const [user, setUser] = useState(propUser)
  const [isAuth, setIsAuth] = useState(isAuthenticated())
  const [userRole, setUserRole] = useState(getUserRole())
  const [unreadCount, setUnreadCount] = useState(0)
  const navigate = useNavigate()

  // Debug log for role
  console.log("Navigation - User Role:", userRole)

  // Update auth state whenever the component mounts or the propUser changes
  useEffect(() => {
    const checkAuth = async () => {
      // Debug log
      console.log("Navigation - checkAuth - Checking authentication")

      const authenticated = isAuthenticated()
      setIsAuth(authenticated)

      if (authenticated) {
        const role = getUserRole()
        console.log("Navigation - checkAuth - User Role:", role)
        setUserRole(role)

        // If we don't have user data from props, fetch it
        if (!propUser) {
          try {
            // Try to get user from localStorage first for faster loading
            const userData = localStorage.getItem("userData")
            if (userData) {
              // Debug log
              console.log("Navigation - checkAuth - User data found in localStorage")

              // Set user from localStorage
              setUser(JSON.parse(userData))
            } else {
              // If not in localStorage, fetch from API
              const { user } = await getCurrentUser()
              console.log("Navigation - checkAuth - Fetched User:", user)
              setUser(user)
            }
          } catch (error) {
            console.error("Error fetching user in Navigation:", error)
          }
        } else {
          setUser(propUser)
        }
      } else {
        setUser(null)
        setUserRole(null)
      }
    }

    checkAuth()
  }, [propUser])

  // Fetch unread notifications count
  useEffect(() => {
    if (isAuth) {
      // This would be replaced with an actual API call
      // For now, we'll just simulate some unread notifications
      setUnreadCount(3)
    }
  }, [isAuth])

  const handleLogout = () => {
    // Debug log
    console.log("Navigation - handleLogout - Logging out")

    logout()
    setIsAuth(false)
    setUser(null)
    setUserRole(null)

    // Use React Router for navigation instead of page refresh
    navigate("/")
  }

  // Check if user is admin or leader
  const isAdmin = userRole === "admin" || userRole === "leader"
  console.log("Navigation - Is Admin:", isAdmin, "Role:", userRole)

  return (
    <nav className="main-navigation">
      <ul className="nav-links">
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/badges">Badges</Link>
        </li>
        <li>
          <Link to="/photos">Photos</Link>
        </li>
        <li>
          <Link to="/games">Games</Link>
        </li>
        <li>
            <Link to="/events">Events</Link>
          </li>

        {/* Communication System Links */}
        <li>
          <Link to="/announcements">Announcements</Link>
        </li>

        {isAuth && (
          <li className="dropdown">
            <span className="dropdown-toggle">Communication</span>
            <ul className="dropdown-menu">
              <li>
                <Link to="/messages">Messages</Link>
              </li>
              <li>
                <Link to="/notifications">
                  Notifications
                  {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                </Link>
              </li>
              <li>
                <Link to="/group-conversations">Group Chats</Link>
              </li>
              <li>
                <Link to="/newsletter">Newsletter</Link>
              </li>
            </ul>
          </li>
        )}

        {/* Events Link - Always visible for authenticated users */}
        

        {isAuth && userRole === "leader" && (
          <li>
            <Link to="/leader">Leader Dashboard</Link>
          </li>
        )}

        {isAuth && (userRole === "helper" || userRole === "leader") && (
          <li>
            <Link to="/helper">Helper Dashboard</Link>
          </li>
        )}

        {isAuth && isAdmin && (
          <li className="dropdown">
            <span className="dropdown-toggle">Admin</span>
            <ul className="dropdown-menu">
              <li>
                <Link to="/admin">Dashboard</Link>
              </li>
              <li>
                <Link to="/admin/badges">Manage Badges</Link>
              </li>
              <li>
                <Link to="/admin/achievements">Badge Achievements</Link>
              </li>
              <li>
                <Link to="/admin/users">Manage Users</Link>
              </li>
              <li>
                <Link to="/admin/announcements" className="nav-link">
                  Управление объявлениями
                </Link>
              </li>
            </ul>
          </li>
        )}

        {!isAuth ? (
          <li>
            <Link to="/login">Login / Register</Link>
          </li>
        ) : (
          <>
            <li>
              <Link to="/profile">My Profile {user && `(${user.firstName})`}</Link>
            </li>
            <li>
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  )
}

export default Navigation
