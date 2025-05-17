import PhotoUpload from "../components/PhotoUpload"
import { isAuthenticated } from "../utils/auth"
import { Navigate } from "react-router-dom"

const PhotoUploadPage = () => {
  // Проверяем авторизацию
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: "/photos/upload" }} />
  }

  return (
    <div className="photo-upload-page">
      <h1>Upload New Photo</h1>
      <PhotoUpload />
    </div>
  )
}

export default PhotoUploadPage
