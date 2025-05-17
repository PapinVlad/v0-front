"use client"

import { useState, useEffect } from "react"
import api from "../utils/api"

const UserBadges = ({ userId, isCurrentUser }) => {
  const [badges, setBadges] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchUserBadges = async () => {
      try {
        const response = await api.get(`/achievements/user/${userId}`)
        setBadges(response.data.badges)
      } catch (error) {
        console.error("Error fetching user badges:", error)
        setError("Failed to load badges. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchUserBadges()
  }, [userId])

  if (loading) {
    return <div className="loading">Loading badges...</div>
  }

  if (error) {
    return <div className="error-message">{error}</div>
  }

  if (badges.length === 0) {
    return (
      <div className="user-badges">
        <h3>Earned Badges</h3>
        <p className="no-badges-message">{isCurrentUser ? "You haven't" : "This user hasn't"} earned any badges yet.</p>
      </div>
    )
  }

  return (
    <div className="user-badges">
      <h3>Earned Badges ({badges.length})</h3>
      <div className="badges-grid">
        {badges.map((achievement) => (
          <div key={achievement.id} className="badge-achievement">
            <div className="badge-image">
              {achievement.badge.imageUrl ? (
                <img
                  src={`http://localhost:5000${achievement.badge.imageUrl}`}
                  alt={achievement.badge.name}
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src = "/placeholder-badge.png"
                  }}
                />
              ) : (
                <div className="placeholder-image">
                  <span>{achievement.badge.name.charAt(0)}</span>
                </div>
              )}
            </div>
            <div className="badge-info">
              <h4>{achievement.badge.name}</h4>
              <span className="badge-category">{achievement.badge.category}</span>
              <div className="badge-meta">
                <span className="awarded-date">Awarded: {new Date(achievement.awardedDate).toLocaleDateString()}</span>
                {achievement.awardedByUser && (
                  <span className="awarded-by">
                    By: {achievement.awardedByUser.firstName} {achievement.awardedByUser.lastName}
                  </span>
                )}
              </div>
              {achievement.notes && <p className="badge-notes">{achievement.notes}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default UserBadges
