"use client"

import { useState } from "react"
import { login } from "../utils/auth"

const LoginForm = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState("")

  const { username, password } = formData

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    // Clear error for this field when user starts typing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" })
    }
    // Clear server error when user starts typing
    if (serverError) {
      setServerError("")
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!username.trim()) {
      newErrors.username = "Username is required"
    }

    if (!password) {
      newErrors.password = "Password is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError("")

    // Validate form
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      // Debug log
      console.log("LoginForm - Submitting login form:", { username })

      const data = await login({ username, password })

      // Debug log
      console.log("LoginForm - Login success:", data)

      setLoading(false)

      // Call the success callback with the data
      if (onLoginSuccess) {
        onLoginSuccess(data)
      }
    } catch (err) {
      // Debug log
      console.error("LoginForm - Login error:", err)

      setLoading(false)
      setServerError(err.message || "Login failed. Please try again.")
    }
  }

  return (
    <div className="login-form">
      <h2>Login</h2>
      {serverError && <div className="error-message">{serverError}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={username}
            onChange={handleChange}
            className={errors.username ? "error" : ""}
          />
          {errors.username && <div className="field-error">{errors.username}</div>}
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={handleChange}
            className={errors.password ? "error" : ""}
          />
          {errors.password && <div className="field-error">{errors.password}</div>}
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  )
}

export default LoginForm
