"use client"

import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { getPhotoById, deletePhoto } from "../utils/api"
import { getUserId, getUserRole, isAuthenticated } from "../utils/auth"
import "../styles/PhotoDetailPage.css"

const PhotoDetailPage = () => {
  const { id } = useParams()
  const [photo, setPhoto] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const navigate = useNavigate()
  const userId = getUserId()
  const userRole = getUserRole()
  const isAuth = isAuthenticated()

  useEffect(() => {
    const fetchPhoto = async () => {
      try {
        setLoading(true)
        const response = await getPhotoById(id)

        if (response.success) {
          setPhoto(response.photo)
        } else {
          setError(response.message || "Failed to fetch photo")
        }
      } catch (err) {
        console.error("Error fetching photo:", err)
        setError("Error fetching photo. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchPhoto()
  }, [id])

  // Проверка прав с учетом авторизации
  const canEditOrDelete = isAuth && photo && 
    (userId === photo.uploaded_by || userRole === "leader" || userRole === "admin")

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      const response = await deletePhoto(id)

      if (response.success) {
        navigate("/photos", { 
          state: { 
            message: "Photo deleted successfully",
            timestamp: Date.now() 
          } 
        })
      } else {
        setError(response.message || "Failed to delete photo")
      }
    } catch (err) {
      console.error("Error deleting photo:", err)
      setError(err.response?.data?.message || "Error deleting photo. Please try again later.")
      
      // Если ошибка авторизации
      if (err.response?.status === 401) {
        navigate("/login", { state: { from: location.pathname } })
      }
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const handleModalClose = (e) => {
    if (e.target.classList.contains("delete-confirm-modal")) {
      setShowDeleteConfirm(false)
    }
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        Loading photo...
      </div>
    )
  }

  if (error) {
    return <div className="error">{error}</div>
  }

  if (!photo) {
    return <div className="not-found">Photo not found</div>
  }

  // Формирование URL изображения
  const getImageUrl = (url) => {
    if (!url) return "/placeholder.jpg"
    if (url.startsWith("http")) return url
    return `${process.env.REACT_APP_API_URL || "http://localhost:5000"}${url}`
  }

  return (
    <div className="photo-detail-page">
      <div className="photo-navigation">
        <Link to="/photos" className="back-link">
          &larr; Back to Gallery
        </Link>

        {canEditOrDelete && (
          <div className="photo-actions">
            <Link to={`/photos/${id}/edit`} className="edit-button">
              Edit Photo
            </Link>
            <button 
              className="delete-button" 
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Photo"}
            </button>
            
          </div>
        )}
      </div>

      <div className="photo-container">
        <div className="photo-image">
          <img
            src={getImageUrl(photo.image_url)}
            alt={photo.title || "Photo"}
            onError={(e) => {
              e.target.onerror = null
              e.target.src = "/placeholder.jpg"
            }}
          />
        </div>

        <div className="photo-info">
          <h1>{photo.title || "Untitled"}</h1>

          {photo.description && (
            <div className="photo-description">
              <p>{photo.description}</p>
            </div>
          )}

          <div className="photo-metadata">
            {photo.event_name && (
              <p>
                <strong>Event:</strong>{" "}
                <Link to={`/events/${photo.event_id}`}>{photo.event_name}</Link>
              </p>
            )}

            {photo.uploader_name && (
              <p>
                <strong>Uploaded by:</strong> {photo.uploader_name}
              </p>
            )}

            <p>
              <strong>Uploaded on:</strong>{" "}
              {new Date(photo.upload_date).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>

            {photo.tags?.length > 0 && (
              <div className="photo-tags">
                <strong>Tags:</strong>
                <div className="tag-list">
                  {photo.tags.map((tag) => (
                    <Link 
                      key={tag} 
                      to={`/photos?tag=${encodeURIComponent(tag)}`} 
                      className="tag-item"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div 
          className="delete-confirm-modal" 
          onClick={handleModalClose}
        >
          <div className="modal-content">
            <h2>Confirm Delete</h2>
            <p>Are you sure you want to delete this photo? This action cannot be undone.</p>
            <div className="modal-actions">
              <button 
                className="confirm-button" 
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <span className="spinner-small"></span>
                    Deleting...
                  </>
                ) : "Yes, Delete"}
              </button>
              <button 
                className="cancel-button" 
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PhotoDetailPage