"use client"

import { useState, useEffect } from "react";
import api from "../utils/api";

const BadgeAchievementStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/achievements/statistics");
        console.log("Stats response:", response.data);
        setStats(response.data.stats);
      } catch (error) {
        console.error("Error fetching achievement statistics:", error);
        setError("Failed to load statistics. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="loading">Loading statistics...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!stats) {
    return <div className="no-stats">No achievement statistics available</div>;
  }

  return (
    <div className="achievement-stats">
      <div className="stats-header">
        <h3>Badge Achievement Statistics</h3>
        <div className="total-achievements">
          <span className="total-number">{stats.totalCount || 0}</span>
          <span className="total-label">Total Badges Awarded</span>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stats-card">
          <h4>Top Badges</h4>
          {stats.topBadges && stats.topBadges.length > 0 ? (
            <ul className="stats-list">
              {stats.topBadges.slice(0, 5).map((item) => (
                <li key={item.badge_id}>
                  <span className="item-name">{item.name}</span>
                  <span className="item-count">{item.count}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No badges awarded yet</p>
          )}
        </div>

        <div className="stats-card">
          <h4>By Category</h4>
          {stats.categoryCounts && stats.categoryCounts.length > 0 ? (
            <ul className="stats-list">
              {stats.categoryCounts.map((item) => (
                <li key={item.category}>
                  <span className="item-name">{item.category}</span>
                  <span className="item-count">{item.count}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No badges awarded yet</p>
          )}
        </div>
      </div>

      <div className="recent-achievements">
        <h4>Recent Achievements</h4>
        {stats.recent && stats.recent.length > 0 ? (
          <ul className="recent-list">
            {stats.recent.map((achievement) => (
              <li key={achievement.id}>
                <span className="user-name">
                  {achievement.user.firstName} {achievement.user.lastName}
                </span>
                <span className="earned">earned</span>
                <span className="badge-name">{achievement.badge.name}</span>
                <span className="earned-date">
                  on {new Date(achievement.awardedDate).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No recent achievements</p>
        )}
      </div>
    </div>
  );
};

export default BadgeAchievementStats;