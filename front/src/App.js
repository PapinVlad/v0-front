"use client"

import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { getCurrentUser, isAuthenticated, getUserRole } from "./utils/auth"

// Import pages
import HomePage from "./pages/HomePage"
import LoginPage from "./pages/LoginPage"
import ProfilePage from "./pages/ProfilePage"
import LeaderPage from "./pages/LeaderPage"
import HelperPage from "./pages/HelperPage"
import BadgesPage from "./pages/BadgesPage"
import PhotosPage from "./pages/PhotosPage"
import GamesPage from "./pages/GamesPage"
import EventsPage from "./pages/EventsPage"
import HelperRegistrationPage from "./pages/HelperRegistrationPage"

// Communication System Pages
import MessagingPage from "./pages/MessagingPage"
import AnnouncementsPage from "./pages/AnnouncementsPage"
import NotificationsPage from "./pages/NotificationsPage"
import GroupConversationsPage from "./pages/GroupConversationsPage"
import NewsletterPage from "./pages/NewsletterPage"
import CreateGroupConversationPage from "./pages/CreateGroupConversationPage" // Новый импорт

// Admin pages
import AdminDashboard from "./pages/AdminDashboard"
import BadgeManagement from "./pages/BadgeManagement"
import CreateBadge from "./pages/CreateBadge"
import EditBadge from "./pages/EditBadge"
import UserManagement from "./pages/UserManagement"
import BadgeAchievementPage from "./pages/BadgeAchievementPage"

// Import components
import Header from "./components/Header"
import Footer from "./components/Footer"
import Navigation from "./components/Navigation"
import AnnouncementForm from "./components/announcements/AnnouncementForm"

// Добавьте импорты для новых компонентов
import PhotoUploadPage from "./pages/PhotoUploadPage"
import PhotoDetailPage from "./pages/PhotoDetailPage"

const App = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchUser = async () => {
      // Debug log
      console.log("App.js - fetchUser - Checking authentication")

      // Only try to fetch user if we have a token
      if (isAuthenticated()) {
        console.log("App.js - fetchUser - User is authenticated, fetching user data")
        try {
          const { user } = await getCurrentUser()
          console.log("App.js - fetchUser - User data fetched:", user)
          setUser(user)
        } catch (error) {
          console.error("Error fetching user:", error)
          setError("Failed to authenticate. Please login again.")
          // If there's an authentication error, clear the user
          setUser(null)
        }
      } else {
        console.log("App.js - fetchUser - User is not authenticated")
        // No token, so no user
        setUser(null)
      }
      setLoading(false)
    }

    fetchUser()
  }, [])

  // Protected route component
  const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const userRole = getUserRole()
    const isAuth = isAuthenticated()

    // Debug log
    console.log("ProtectedRoute - isAuth:", isAuth, "userRole:", userRole, "allowedRoles:", allowedRoles)

    if (loading) {
      return <div>Loading...</div>
    }

    if (!isAuth) {
      console.log("ProtectedRoute - User is not authenticated, redirecting to login")
      return <Navigate to="/login" />
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
      console.log("ProtectedRoute - User role not allowed, redirecting to home")
      return <Navigate to="/" />
    }

    return children
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <Router>
      <div className="app">
        <Header />
        <Navigation user={user} />

        {error && (
          <div className="error-banner">
            {error}
            <button onClick={() => setError(null)}>Dismiss</button>
          </div>
        )}

        <main className="main-content">
          <Routes>
            {/* Публичные маршруты */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/badges" element={<BadgesPage />} />
            <Route path="/photos" element={<PhotosPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/games" element={<GamesPage />} />

            {/* Публичный маршрут для объявлений */}
            <Route path="/announcements" element={<AnnouncementsPage />} />

            {/* Communication System Routes */}
            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <MessagingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/group-conversations"
              element={
                <ProtectedRoute>
                  <GroupConversationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/group-conversations/new"
              element={
                <ProtectedRoute allowedRoles={["admin", "leader"]}>
                  <CreateGroupConversationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/group-conversations/:id"
              element={
                <ProtectedRoute>
                  <GroupConversationsPage />
                </ProtectedRoute>
              }
            />
            <Route path="/newsletter" element={<NewsletterPage />} />

            {/* Protected routes */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/leader"
              element={
                <ProtectedRoute allowedRoles={["leader"]}>
                  <LeaderPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/helper"
              element={
                <ProtectedRoute allowedRoles={["helper", "leader"]}>
                  <HelperPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/helper/register"
              element={
                <ProtectedRoute>
                  <HelperRegistrationPage />
                </ProtectedRoute>
              }
            />

            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin", "leader"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/badges"
              element={
                <ProtectedRoute allowedRoles={["admin", "leader"]}>
                  <BadgeManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/badges/new"
              element={
                <ProtectedRoute allowedRoles={["admin", "leader"]}>
                  <CreateBadge />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/badges/edit/:id"
              element={
                <ProtectedRoute allowedRoles={["admin", "leader"]}>
                  <EditBadge />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={["admin", "leader"]}>
                  <UserManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/achievements"
              element={
                <ProtectedRoute allowedRoles={["admin", "leader"]}>
                  <BadgeAchievementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/announcements/create"
              element={
                <ProtectedRoute allowedRoles={["admin", "leader"]}>
                  <AnnouncementForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/announcements/edit/:id"
              element={
                <ProtectedRoute allowedRoles={["admin", "leader"]}>
                  <AnnouncementForm isEdit={true} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/announcements"
              element={
                <ProtectedRoute allowedRoles={["admin", "leader"]}>
                  <AnnouncementsPage isAdmin={true} />
                </ProtectedRoute>
              }
            />
            {/* Добавьте маршруты для фотогалереи в компонент Routes */}
            <Route path="/photos/upload" element={<PhotoUploadPage />} />
            <Route path="/photos/:id" element={<PhotoDetailPage />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  )
}

export default App
