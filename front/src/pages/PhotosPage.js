"use client"

import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import PhotoGallery from "../components/PhotoGallery"
import { isAuthenticated } from "../utils/auth"
import "../styles/PhotosPage.css"

const PhotosPage = () => {
  const [filter, setFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const location = useLocation()
  const isLoggedIn = isAuthenticated()

  // Получаем параметры из URL
  const queryParams = new URLSearchParams(location.search)
  const eventId = queryParams.get("event")
  const tag = queryParams.get("tag")

  // Определяем заголовок страницы
  let pageTitle = "Photo Gallery"
  if (eventId) {
    pageTitle = "Event Photos"
  } else if (tag) {
    pageTitle = `Photos tagged with "${tag}"`
  }

  return (
    <div className="photos-page">
      <div className="photos-header">
        <h1>{pageTitle}</h1>

        {isLoggedIn && (
          <Link to="/photos/upload" className="upload-button">
            Upload New Photo
          </Link>
        )}
      </div>

      <div className="photos-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search photos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-options">
          <label>Filter by:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Photos</option>
            <option value="recent">Recent</option>
            {isLoggedIn && <option value="my">My Uploads</option>}
          </select>
        </div>
      </div>

      <div className="photos-content">
        {eventId ? (
          <PhotoGallery eventId={eventId} />
        ) : tag ? (
          <PhotoGallery tag={tag} />
        ) : (
          <PhotoGallery isPublic={!isLoggedIn} />
        )}
      </div>
    </div>
  )
}

export default PhotosPage
