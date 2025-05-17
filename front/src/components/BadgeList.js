"use client"

const BadgeList = ({ badges, onBadgeSelect }) => {
  // Проверяем, что badges существует и является массивом
  if (!badges || !Array.isArray(badges)) {
    console.error("BadgeList: badges is not an array:", badges)
    return <div className="no-badges">Нет доступных значков</div>
  }

  if (badges.length === 0) {
    return <div className="no-badges">Нет значков, соответствующих вашим критериям</div>
  }

  return (
    <div className="badge-list">
      {badges.map((badge) => (
        <div key={badge.id} className="badge-item" onClick={() => onBadgeSelect(badge.id)}>
          <div className="badge-item-image">
            {badge.imageUrl ? (
              <img
                src={`http://localhost:5000${badge.imageUrl}`}
                alt={badge.name}
                onError={(e) => {
                  console.error(`Error loading badge image: ${e.target.src}`)
                  e.target.onerror = null
                  e.target.src = "/placeholder-badge.png"
                }}
              />
            ) : (
              <div className="placeholder-image">
                <span>{badge.name ? badge.name.charAt(0) : "?"}</span>
              </div>
            )}
          </div>
          <div className="badge-item-info">
            <h3>{badge.name || "Без названия"}</h3>
            <span className="badge-category">{badge.category || "Без категории"}</span>
            <div className="badge-difficulty">
              {badge.difficultyLevel ? Array(badge.difficultyLevel).fill("★").join("") : ""}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default BadgeList
