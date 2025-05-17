"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import LoginForm from "../components/LoginForm"
import RegisterForm from "../components/RegisterForm"
import { isAuthenticated } from "../utils/auth"

const LoginPage = () => {
  const [showRegister, setShowRegister] = useState(false)
  const navigate = useNavigate()

  // Check if user is already authenticated
  useEffect(() => {
    // Debug log
    console.log("LoginPage - Checking authentication")

    if (isAuthenticated()) {
      console.log("LoginPage - User is already authenticated, redirecting to home")
      navigate("/")
    }
  }, [navigate])

  const handleLoginSuccess = (data) => {
    // Debug log
    console.log("LoginPage - Login success:", data)

    // Store user data in localStorage for persistence
    localStorage.setItem("userData", JSON.stringify(data.user))

    // Redirect to home page without page refresh
    navigate("/")
  }

  const toggleForm = () => {
    setShowRegister(!showRegister)
  }

  return (
    <div className="login-page">
      <div className="form-container">
        {showRegister ? (
          <>
            <RegisterForm onRegisterSuccess={handleLoginSuccess} />
            <p className="toggle-form">
              Already have an account?{" "}
              <button type="button" onClick={toggleForm}>
                Login
              </button>
            </p>
          </>
        ) : (
          <>
            <LoginForm onLoginSuccess={handleLoginSuccess} />
            <p className="toggle-form">
              Don't have an account?{" "}
              <button type="button" onClick={toggleForm}>
                Register
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default LoginPage
