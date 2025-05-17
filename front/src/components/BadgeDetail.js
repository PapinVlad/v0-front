"use client"

const BadgeDetail = ({ badge, onBack }) => {
  return (
    <div className="badge-detail">
      <button onClick={onBack} className="back-button">
        &larr; Back to All Badges
      </button>

      <div className="badge-detail-content">
        <div className="badge-detail-header">
          <div className="badge-detail-image">
            {badge.imageUrl ? (
              <img
                src={`http://localhost:5000${badge.imageUrl}`}
                alt={badge.name}
                onError={(e) => {
                  e.target.onerror = null
                  e.target.src = "/placeholder-badge.png"
                }}
              />
            ) : (
              <div className="placeholder-image large">
                <span>{badge.name.charAt(0)}</span>
              </div>
            )}
          </div>

          <div className="badge-detail-info">
            <h2>{badge.name}</h2>
            <div className="badge-meta">
              <span className="badge-category">{badge.category}</span>
              <div className="badge-difficulty">Difficulty: {Array(badge.difficultyLevel).fill("★").join("")}</div>
            </div>
            <p className="badge-description">{badge.description}</p>
          </div>
        </div>

        <div className="badge-sections">
          <div className="badge-section">
            <h3>Requirements</h3>
            {badge.requirements && badge.requirements.length > 0 ? (
              <ol className="requirements-list">
                {badge.requirements.map((requirement, index) => (
                  <li key={index}>{requirement}</li>
                ))}
              </ol>
            ) : (
              <p>No specific requirements listed for this badge.</p>
            )}
          </div>

          <div className="badge-section">
            <h3>Suggested Activities</h3>
            {badge.activities && badge.activities.length > 0 ? (
              <ul className="activities-list">
                {badge.activities.map((activity, index) => (
                  <li key={index}>{activity}</li>
                ))}
              </ul>
            ) : (
              <p>No suggested activities listed for this badge.</p>
            )}
          </div>

          {badge.resources && badge.resources.length > 0 && (
            <div className="badge-section">
              <h3>Resources</h3>
              <ul className="resources-list">
                {badge.resources.map((resource) => (
                  <li key={resource.id}>
                    <a href={resource.url} target="_blank" rel="noopener noreferrer" className="resource-link">
                      {resource.title} ({resource.type})
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BadgeDetail
