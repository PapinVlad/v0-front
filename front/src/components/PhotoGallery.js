"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getPhotos, deletePhoto, updatePhoto } from "../utils/api";
import "../styles/PhotoGallery.css";
import { isAuthenticated, getUserRole, getUserId } from "../utils/auth";

const PhotoGallery = ({ eventId, tag, isPublic = false }) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    public_visible: false,
    leaders_only_visible: false,
    file: null,
  });

    // Authorization flags
  const isLoggedIn = isAuthenticated();
  const userRole   = isLoggedIn ? getUserRole() : null;  // "admin", "helper", etc.
  const userId     = isLoggedIn ? getUserId()   : null;  // matches photo.uploaded_by
  const hasEditDeleteAccess = (photo) => {
    return isLoggedIn && (
      userRole === "admin" || 
      userRole === "leader" || 
      userId === photo?.uploaded_by
    );
  };
  
  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        setLoading(true);
        console.log("Fetching photos with params:", { eventId, tag, isPublic });

        let endpoint = "";
        if (eventId) {
          endpoint = `/event/${eventId}`;
        } else if (tag) {
          endpoint = `/tag/${tag}`;
        } else if (isPublic) {
          endpoint = "/public";
        }

        console.log("Using endpoint:", endpoint);
        const response = await getPhotos(endpoint);
        console.log("API response:", response);

        if (response.success && response.data && response.data.length > 0) {
          console.log("Sample photo data:", response.data[0]);
        }

        setDebugInfo({
          endpoint,
          response,
          timestamp: new Date().toISOString(),
        });

        if (response.success) {
          let photoData = [];
          if (Array.isArray(response.data)) {
            photoData = response.data;
          } else if (Array.isArray(response.photos)) {
            photoData = response.photos;
          } else if (response.data && Array.isArray(response.data.photos)) {
            photoData = response.data.photos;
          } else {
            console.warn("Unexpected response format:", response);
            photoData = [];
          }

          console.log("Processed photo data:", photoData);
          setPhotos(photoData);
        } else {
          setError(response.message || "Failed to fetch photos");
          setPhotos([]);
        }
      } catch (err) {
        console.error("Error fetching photos:", err);
        setError("Error fetching photos. Please try again later.");
        setPhotos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, [eventId, tag, isPublic]);

  const openPhotoModal = (photo) => {
    setSelectedPhoto(photo);
    setEditForm({
      title: photo.title || "",
      description: photo.description || "",
      public_visible: !!photo.public_visible,
      leaders_only_visible: !!photo.leaders_only_visible,
      file: null,
    });
  };

  const closePhotoModal = () => {
    setSelectedPhoto(null);
    setIsEditing(false);
  };

  const handleDeletePhoto = async (photoId) => {
    if (window.confirm("Are you sure you want to delete this photo?")) {
      try {
        const response = await deletePhoto(photoId);
        if (response.success) {
          setPhotos(photos.filter((photo) => photo.photo_id !== photoId));
          console.log("Photo deleted successfully");
          closePhotoModal();
        } else {
          setError(response.message || "Failed to delete photo");
        }
      } catch (err) {
        console.error("Error deleting photo:", err);
        setError("Error deleting photo. Please try again later.");
      }
    }
  };

  const handleUpdatePhoto = async () => {
    try {
      const formData = new FormData();
      formData.append("title", editForm.title);
      formData.append("description", editForm.description);
      formData.append("public_visible", editForm.public_visible);
      formData.append("leaders_only_visible", editForm.leaders_only_visible);
      if (editForm.file) {
        formData.append("image", editForm.file);
      }

      const response = await updatePhoto(selectedPhoto.photo_id, formData);
      if (response.success) {
        setPhotos(
          photos.map((photo) =>
            photo.photo_id === selectedPhoto.photo_id ? { ...photo, ...response.data } : photo
          )
        );
        setSelectedPhoto(response.data);
        setIsEditing(false);
        console.log("Photo updated successfully");
      } else {
        setError(response.message || "Failed to update photo");
      }
    } catch (err) {
      console.error("Error updating photo:", err);
      setError("Error updating photo. Please try again later.");
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/placeholder.jpg";
    if (imagePath.startsWith("http")) return imagePath;
    const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
    if (imagePath.startsWith("/")) {
      return `${baseUrl}${imagePath}`;
    } else {
      return `${baseUrl}/${imagePath}`;
    }
  };

  if (loading) {
    return <div className="loading">Loading photos...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error">{error}</div>
        <button onClick={() => window.location.reload()} className="reload-button">
          Reload Page
        </button>
        {debugInfo && (
          <div className="debug-info">
            <h4>Debug Information:</h4>
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}
      </div>
    );
  }

  if (!photos || photos.length === 0) {
    return (
      <div className="no-photos-container">
        <div className="no-photos">No photos available.</div>
        {debugInfo && (
          <div className="debug-info">
            <h4>Debug Information:</h4>
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="photo-gallery">
      <div className="photo-grid">
        {photos.map((photo) => (
          <div key={photo.photo_id} className="photo-item" onClick={() => openPhotoModal(photo)}>
            <img
              src={getImageUrl(photo.thumbnail_url) || "/placeholder.jpg"}
              alt={photo.title || "Photo"}
              className="photo-thumbnail"
              onError={(e) => {
                console.error(`Error loading image: ${e.target.src}`);
                e.target.onerror = null;
                e.target.src = "/placeholder.jpg";
              }}
            />
            <div className="photo-info">
              <h3>{photo.title || "Untitled"}</h3>
              {photo.event_name && <p>Event: {photo.event_name}</p>}
              {hasEditDeleteAccess(photo) && (
                <button
                  className="delete-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePhoto(photo.photo_id);
                  }}
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedPhoto && (
        <div className="photo-modal" onClick={closePhotoModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close-button" onClick={closePhotoModal}>
              ×
            </span>
            {isEditing ? (
              <div className="edit-form">
                <h2>Edit Photo</h2>
                <label>
                  Title:
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  />
                </label>
                <label>
                  Description:
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  />
                </label>
                <label>
                  Public Visible:
                  <input
                    type="checkbox"
                    checked={editForm.public_visible}
                    onChange={(e) => setEditForm({ ...editForm, public_visible: e.target.checked })}
                  />
                </label>
                <label>
                  Leaders Only Visible:
                  <input
                    type="checkbox"
                    checked={editForm.leaders_only_visible}
                    onChange={(e) => setEditForm({ ...editForm, leaders_only_visible: e.target.checked })}
                  />
                </label>
                <label>
                  New Image (optional):
                  <input
                    type="file"
                    onChange={(e) => setEditForm({ ...editForm, file: e.target.files[0] })}
                  />
                </label>
                <button onClick={handleUpdatePhoto}>Save Changes</button>
                <button onClick={() => setIsEditing(false)}>Cancel</button>
              </div>
            ) : (
              <>
                <img
                  src={getImageUrl(selectedPhoto.image_url) || "/placeholder.jpg"}
                  alt={selectedPhoto.title || "Photo"}
                  className="modal-image"
                  onError={(e) => {
                    console.error(`Error loading modal image: ${e.target.src}`);
                    e.target.onerror = null;
                    e.target.src = "/placeholder.jpg";
                  }}
                />
                <div className="modal-info">
                  <h2>{selectedPhoto.title || "Untitled"}</h2>
                  {selectedPhoto.description && <p>{selectedPhoto.description}</p>}
                  {selectedPhoto.event_name && (
                    <p>
                      Event: <Link to={`/events/${selectedPhoto.event_id}`}>{selectedPhoto.event_name}</Link>
                    </p>
                  )}
                  {selectedPhoto.uploader_name && <p>Uploaded by: {selectedPhoto.uploader_name}</p>}
                  {selectedPhoto.upload_date && (
                    <p>Uploaded on: {new Date(selectedPhoto.upload_date).toLocaleDateString()}</p>
                  )}
                  {selectedPhoto.tags && selectedPhoto.tags.length > 0 && (
                    <div className="photo-tags">
                      <p>Tags:</p>
                      <div className="tag-list">
                        {selectedPhoto.tags.map((tag) => (
                          <Link key={tag} to={`/photos/tag/${tag}`} className="tag-item">
                            {tag}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                  {hasEditDeleteAccess(selectedPhoto) && (
                    <>
                      <button 
                        className="edit-button" 
                        onClick={() => setIsEditing(true)}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePhoto(selectedPhoto.photo_id);
                        }}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {debugInfo && (
        <div className="debug-info">
          <h4>Debug Information:</h4>
          <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default PhotoGallery;