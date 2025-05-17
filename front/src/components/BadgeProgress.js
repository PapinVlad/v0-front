"use client"

import { useState, useEffect } from "react"
import api from "../utils/api"

const BadgeProgress = ({ userId, badgeId, isLeader }) => {
  const [progress, setProgress] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [badge, setBadge] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [progressResponse, badgeResponse] = await Promise.all([
          api.get(`/achievements/progress/${userId}/${badgeId}`),
          api.get(`/badges/${badgeId}`),
        ])

        setProgress(progressResponse.data.progress)
        setBadge(badgeResponse.data.badge)
      } catch (error) {
        console.error("Error fetching badge progress:", error)
        setError("Failed to load progress. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userId, badgeId])

  const handleProgressUpdate = async (requirementId, completed) => {
    try {
      await api.post("/achievements/progress", {
        userId,
        badgeId,
        requirementId,
        completed,
      })

      // Update local state
      setProgress(progress.map((item) => (item.requirementId === requirementId ? { ...item, completed } : item)))
    } catch (error) {
      console.error("Error updating progress:", error)
      setError("Failed to update progress. Please try again.")
    }
  }

  if (loading) {
    return <div className="loading">Loading progress...</div>
  }

  if (error) {
    return <div className="error-message">{error}</div>
  }

  if (!badge) {
    return <div className="error-message">Badge not found</div>
  }

  const completedCount = progress.filter((item) => item.completed).length
  const totalRequirements = badge.requirements ? badge.requirements.length : 0
  const progressPercentage = totalRequirements > 0 ? Math.round((completedCount / totalRequirements) * 100) : 0

  return (
    <div className="badge-progress">
      <div className="badge-progress-header">
        <h3>Progress for {badge.name}</h3>
        <div className="progress-summary">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progressPercentage}%` }}></div>
          </div>
          <span className="progress-text">
            {completedCount} of {totalRequirements} requirements completed ({progressPercentage}%)
          </span>
        </div>
      </div>

      {badge.requirements && badge.requirements.length > 0 ? (
        <div className="requirements-list">
          {badge.requirements.map((requirement, index) => {
            const progressItem = progress.find((p) => p.requirementText === requirement)
            const isCompleted = progressItem ? progressItem.completed : false

            return (
              <div key={index} className={`requirement-item ${isCompleted ? "completed" : ""}`}>
                <div className="requirement-content">
                  <span className="requirement-number">{index + 1}.</span>
                  <span className="requirement-text">{requirement}</span>
                </div>

                {isLeader && (
                  <div className="requirement-actions">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={isCompleted}
                        onChange={(e) =>
                          handleProgressUpdate(progressItem ? progressItem.requirementId : null, e.target.checked)
                        }
                      />
                      <span className="checkbox-text">{isCompleted ? "Completed" : "Mark as completed"}</span>
                    </label>
                  </div>
                )}

                {!isLeader && isCompleted && (
                  <div className="completion-status">
                    <span className="completed-text">✓ Completed</span>
                    {progressItem.completedDate && (
                      <span className="completed-date">
                        on {new Date(progressItem.completedDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <p>No requirements found for this badge.</p>
      )}
    </div>
  )
}

export default BadgeProgress
