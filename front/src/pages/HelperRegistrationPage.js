"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import api from "../utils/api"
import { getCurrentUser } from "../utils/auth"

const HelperRegistrationPage = () => {
  const [formData, setFormData] = useState({
    contactNumber: "",
    streetAddress: "",
    city: "",
    postcode: "",
    skills: "",
    notes: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [userData, setUserData] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        const { user } = await getCurrentUser()
        setUserData(user)
      } catch (error) {
        console.error("Error fetching user data:", error)
        setError("Failed to load user data. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      console.log("Submitting helper registration form:", formData)
      const response = await api.post("/helpers/register", formData)
      console.log("Registration response:", response.data)
      setSuccess(true)

      // Redirect to helper page after successful registration
      setTimeout(() => {
        navigate("/helper")
      }, 2000)
    } catch (error) {
      console.error("Error registering as helper:", error)
      const errorMessage = error.response?.data?.message || "Failed to register as helper. Please try again."
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (loading && !userData) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="helper-registration-page">
      <h1>Complete Your Helper Profile</h1>

      {userData && (
        <div className="user-info">
          <p>
            Hello, {userData.firstName} {userData.lastName}! Please complete your helper profile below.
          </p>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      {success ? (
        <div className="success-message">
          <h2>Registration Successful!</h2>
          <p>Your helper profile has been created. Redirecting to helper dashboard...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="helper-form">
          <div className="form-group">
            <label htmlFor="contactNumber">Contact Number *</label>
            <input
              type="tel"
              id="contactNumber"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="streetAddress">Street Address *</label>
            <input
              type="text"
              id="streetAddress"
              name="streetAddress"
              value={formData.streetAddress}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="city">City *</label>
            <input type="text" id="city" name="city" value={formData.city} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="postcode">Postcode *</label>
            <input
              type="text"
              id="postcode"
              name="postcode"
              value={formData.postcode}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="skills">Skills (optional)</label>
            <textarea
              id="skills"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="List any relevant skills or qualifications"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="notes">Additional Notes (optional)</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any additional information you'd like to share"
              rows="3"
            />
          </div>

          <div className="disclosure-notice">
            <p>
              <strong>Important:</strong> By registering as a helper, you acknowledge that you will need to complete a
              disclosure check before working directly with children. Our leader team will contact you with more
              information about this process.
            </p>
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? "Submitting..." : "Complete Registration"}
            </button>
            <button type="button" className="cancel-button" onClick={() => navigate(-1)} disabled={loading}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default HelperRegistrationPage
