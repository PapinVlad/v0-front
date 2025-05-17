"use client"

const LeaderPage = () => {
  return (
    <div className="leader-page">
      <h1>Leader Dashboard</h1>
      <p>Welcome to the Leader Dashboard. Here you can manage helpers, events, and more.</p>
      <div className="leader-content">
        <div className="dashboard-section">
          <h2>Helper Management</h2>
          <p>View and manage helper information.</p>
          <button onClick={() => (window.location.href = "/admin/users")} className="dashboard-button">
            Manage Helpers
          </button>
        </div>
        <div className="dashboard-section">
          <h2>Event Management</h2>
          <p>Create and manage events.</p>
          <button onClick={() => (window.location.href = "/events")} className="dashboard-button">
            Manage Events
          </button>
        </div>
        <div className="dashboard-section">
          <h2>Badge Management</h2>
          <p>Manage badges and track achievements.</p>
          <div className="button-group">
            <button onClick={() => (window.location.href = "/admin/badges")} className="dashboard-button">
              Manage Badges
            </button>
            <button onClick={() => (window.location.href = "/admin/achievements")} className="dashboard-button">
              Track Achievements
            </button>
          </div>
        </div>
        <div className="dashboard-section">
          <h2>Photo Management</h2>
          <p>Upload and manage photos.</p>
          <button onClick={() => (window.location.href = "/photos")} className="dashboard-button">
            Manage Photos
          </button>
        </div>
      </div>
    </div>
  )
}

export default LeaderPage
