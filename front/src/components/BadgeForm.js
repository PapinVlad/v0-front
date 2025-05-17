"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import api from "../utils/api"

const BadgeForm = ({ badge = {}, isEditing = false }) => {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    difficultyLevel: 1,
    requirements: [],
    activities: [],
  })
  const [newRequirement, setNewRequirement] = useState("")
  const [newActivity, setNewActivity] = useState("")
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState("")
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Fetch categories
    const fetchCategories = async () => {
      try {
        const response = await api.get("/badges/categories")
        console.log("Categories response:", response.data)
        if (response.data && Array.isArray(response.data.categories)) {
          setCategories(response.data.categories)
        } else {
          console.error("Unexpected categories format:", response.data)
          setCategories([])
        }
      } catch (error) {
        console.error("Error fetching categories:", error)
        setCategories([])
      }
    }

    fetchCategories()

    // If editing, populate form with badge data
    if (isEditing && badge) {
      setFormData({
        name: badge.name || "",
        category: badge.category || "",
        description: badge.description || "",
        difficultyLevel: badge.difficultyLevel || 1,
        requirements: Array.isArray(badge.requirements) ? badge.requirements : [],
        activities: Array.isArray(badge.activities) ? badge.activities : [],
      })

      if (badge.imageUrl) {
        setImagePreview(`http://localhost:5000${badge.imageUrl}`)
      }
    }
  }, [isEditing, badge])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setFormData((prev) => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()],
      }))
      setNewRequirement("")
    }
  }

  const removeRequirement = (index) => {
    setFormData((prev) => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index),
    }))
  }

  const addActivity = () => {
    if (newActivity.trim()) {
      setFormData((prev) => ({
        ...prev,
        activities: [...prev.activities, newActivity.trim()],
      }))
      setNewActivity("")
    }
  }

  const removeActivity = (index) => {
    setFormData((prev) => ({
      ...prev,
      activities: prev.activities.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Create form data for file upload
      const formDataObj = new FormData()
      formDataObj.append("name", formData.name)
      formDataObj.append("category", formData.category)
      formDataObj.append("description", formData.description)
      formDataObj.append("difficultyLevel", formData.difficultyLevel)
      formDataObj.append("requirements", JSON.stringify(formData.requirements))
      formDataObj.append("activities", JSON.stringify(formData.activities))

      if (image) {
        formDataObj.append("image", image)
      }

      let response
      if (isEditing) {
        response = await api.put(`/badges/${badge.id}`, formDataObj, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
      } else {
        response = await api.post("/badges", formDataObj, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
      }

      setLoading(false)
      navigate("/admin/badges")
    } catch (error) {
      setLoading(false)
      console.error("Error saving badge:", error)
      setError(error.response?.data?.message || "Error saving badge")
    }
  }

  return (
    <div className="badge-form">
      <h2>{isEditing ? "Редактирование значка" : "Создание нового значка"}</h2>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Badge Name</label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label htmlFor="category">Category</label>
          <div className="category-input">
            <select id="category" name="category" value={formData.category} onChange={handleChange} required>
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
              <option value="new">+ Add new category</option>
            </select>
            {formData.category === "new" && (
              <input
                type="text"
                placeholder="Enter new category"
                value={formData.newCategory || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, newCategory: e.target.value }))}
                required
              />
            )}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="difficultyLevel">Difficulty Level</label>
          <select id="difficultyLevel" name="difficultyLevel" value={formData.difficultyLevel} onChange={handleChange}>
            <option value="1">1 - Very Easy</option>
            <option value="2">2 - Easy</option>
            <option value="3">3 - Moderate</option>
            <option value="4">4 - Challenging</option>
            <option value="5">5 - Very Challenging</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="image">Badge Image</label>
          <input type="file" id="image" name="image" accept="image/*" onChange={handleImageChange} />
          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview || "/placeholder.svg"} alt="Badge preview" />
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Requirements</label>
          <div className="add-item">
            <input
              type="text"
              value={newRequirement}
              onChange={(e) => setNewRequirement(e.target.value)}
              placeholder="Enter a requirement"
            />
            <button type="button" onClick={addRequirement}>
              Add
            </button>
          </div>
          <ul className="items-list">
            {formData.requirements.map((req, index) => (
              <li key={index}>
                <span>{req}</span>
                <button type="button" onClick={() => removeRequirement(index)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="form-group">
          <label>Suggested Activities</label>
          <div className="add-item">
            <input
              type="text"
              value={newActivity}
              onChange={(e) => setNewActivity(e.target.value)}
              placeholder="Enter an activity"
            />
            <button type="button" onClick={addActivity}>
              Add
            </button>
          </div>
          <ul className="items-list">
            {formData.activities.map((activity, index) => (
              <li key={index}>
                <span>{activity}</span>
                <button type="button" onClick={() => removeActivity(index)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading} className="primary-button">
            {loading ? "Saving..." : isEditing ? "Update Badge" : "Create Badge"}
          </button>
          <button type="button" onClick={() => navigate("/admin/badges")} className="secondary-button">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default BadgeForm
