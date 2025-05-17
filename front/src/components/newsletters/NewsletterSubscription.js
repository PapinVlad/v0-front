"use client"

import { useState } from "react"
import api from "../../utils/api"
import "./Newsletters.css"

const NewsletterSubscription = () => {
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.email) {
      setError("Email is required")
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await api.post("/newsletters/subscribe", formData)

      setSuccess(response.data.message)
      setFormData({
        email: "",
        firstName: "",
        lastName: "",
      })

      setLoading(false)
    } catch (error) {
      console.error("Error subscribing to newsletter:", error)
      setError(error.response?.data?.message || "Failed to subscribe. Please try again later.")
      setLoading(false)
    }
  }

  return (
    <div className="newsletter-subscription">
      <h2>Subscribe to Our Newsletter</h2>
      <p>Stay updated with the latest news, events, and activities from Obanshire Cub Scouts.</p>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email Address *</label>
          <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} />
          </div>
        </div>

        <button type="submit" disabled={loading} className="subscribe-button">
          {loading ? "Subscribing..." : "Subscribe"}
        </button>
      </form>

      <div className="privacy-note">
        <p>
          By subscribing, you agree to receive emails from Obanshire Cub Scouts. You can unsubscribe at any time by
          clicking the unsubscribe link in our emails.
        </p>
      </div>
    </div>
  )
}

export default NewsletterSubscription
