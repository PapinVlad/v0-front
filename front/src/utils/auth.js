import api from "./api"

// Register user
export const register = async (userData) => {
  try {
    const response = await api.post("/auth/register", userData)
    if (response.data.token) {
      // Debug log
      console.log("auth.js - register - Saving token to localStorage")

      localStorage.setItem("token", response.data.token)

      // Save user data for persistence
      localStorage.setItem("userData", JSON.stringify(response.data.user))
    }
    return response.data
  } catch (error) {
    throw error.response ? error.response.data : { message: error.message || "Server error" }
  }
}

// Login user
export const login = async (userData) => {
  try {
    // Debug log
    console.log("auth.js - login - Sending login request with data:", {
      username: userData.username,
      passwordLength: userData.password ? userData.password.length : 0,
    })

    const response = await api.post("/auth/login", userData)

    // Debug log
    console.log("auth.js - login - Login response:", response.data)

    if (response.data.token) {
      // Debug log
      console.log("auth.js - login - Saving token to localStorage")

      localStorage.setItem("token", response.data.token)

      // Save user data for persistence
      localStorage.setItem("userData", JSON.stringify(response.data.user))

      // Debug log for token
      const token = response.data.token
      try {
        const payload = parseToken(token)
        console.log("auth.js - login - Token Payload:", payload)
      } catch (error) {
        console.error("Error parsing token:", error)
      }
    }
    return response.data
  } catch (error) {
    // Debug log
    console.error("auth.js - login - Login error:", error)

    throw error.response ? error.response.data : { message: error.message || "Server error" }
  }
}

// Logout user
export const logout = () => {
  // Debug log
  console.log("auth.js - logout - Removing token from localStorage")

  localStorage.removeItem("token")
  localStorage.removeItem("userData")

  // Use React Router for navigation instead of page refresh
  // window.location.href = "/"
}

// Get current user
export const getCurrentUser = async () => {
  // Check if token exists before making the request
  if (!isAuthenticated()) {
    // Debug log
    console.log("auth.js - getCurrentUser - No token found")

    throw { message: "No authentication token found" }
  }

  try {
    // Debug log
    console.log("auth.js - getCurrentUser - Fetching current user")

    // Try to get user from localStorage first for faster loading
    const userData = localStorage.getItem("userData")
    if (userData) {
      // Debug log
      console.log("auth.js - getCurrentUser - User data found in localStorage")

      // Return user from localStorage
      return { user: JSON.parse(userData) }
    }

    // If not in localStorage, fetch from API
    const response = await api.get("/auth/user")

    // Debug log
    console.log("auth.js - getCurrentUser - Response:", response.data)

    // Save user data for persistence
    localStorage.setItem("userData", JSON.stringify(response.data.user))

    return response.data
  } catch (error) {
    // Debug log
    console.error("auth.js - getCurrentUser - Error:", error)

    // If token is invalid or expired, clear it
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.removeItem("token")
      localStorage.removeItem("userData")
    }
    throw error.response ? error.response.data : { message: error.message || "Server error" }
  }
}

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem("token")

  // Debug log
  console.log("auth.js - isAuthenticated - Token:", token ? "Token found" : "No token")

  if (!token) return false

  // Check if token is expired
  try {
    const payload = parseToken(token)

    // Debug log
    console.log("auth.js - isAuthenticated - Token payload:", payload)

    const expiry = payload.exp * 1000 // Convert to milliseconds

    // Debug log
    console.log("auth.js - isAuthenticated - Token expiry:", new Date(expiry).toISOString())
    console.log("auth.js - isAuthenticated - Current time:", new Date().toISOString())
    console.log("auth.js - isAuthenticated - Is expired:", Date.now() >= expiry)

    if (Date.now() >= expiry) {
      // Token is expired
      localStorage.removeItem("token")
      localStorage.removeItem("userData")
      return false
    }
    return true
  } catch (error) {
    // Debug log
    console.error("auth.js - isAuthenticated - Error parsing token:", error)

    // Invalid token
    localStorage.removeItem("token")
    localStorage.removeItem("userData")
    return false
  }
}

// Get user role from token
export const getUserRole = () => {
  const token = localStorage.getItem("token")

  // Debug log
  console.log("auth.js - getUserRole - Token:", token ? "Token found" : "No token")

  if (!token) return null

  try {
    const payload = parseToken(token)

    // Debug log
    console.log("auth.js - getUserRole - Token Payload:", payload)

    return payload.role
  } catch (error) {
    // Debug log
    console.error("auth.js - getUserRole - Error parsing token:", error)

    // If there's an error parsing the token, remove it as it might be corrupted
    localStorage.removeItem("token")
    localStorage.removeItem("userData")
    return null
  }
}

// Get user ID from localStorage
export const getUserId = () => {
  const userData = localStorage.getItem("userData")

  // Debug log
  console.log("auth.js - getUserId - UserData:", userData ? "Data found" : "No data")

  if (!userData) return null

  try {
    const user = JSON.parse(userData)

    // Debug log
    console.log("auth.js - getUserId - User ID:", user.id || "No ID found")

    return user.id
  } catch (error) {
    // Debug log
    console.error("auth.js - getUserId - Error parsing user data:", error)

    return null
  }
}

// Helper function to parse JWT token
const parseToken = (token) => {
  try {
    // Parse the JWT token (this is a simple parsing, not verification)
    const base64Url = token.split(".")[1]
    if (!base64Url) throw new Error("Invalid token format")

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    )

    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error("Error parsing token:", error)
    throw error
  }
}