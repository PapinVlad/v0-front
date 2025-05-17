"use client"

import { useState, useEffect } from "react"
import { uploadPhoto } from "../utils/api"
import { useNavigate } from "react-router-dom"
import { isAuthenticated, getUserRole } from "../utils/auth"
import "../styles/PhotoUpload.css"
import axios from "axios"

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api"

const PhotoUpload = () => {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [eventId, setEventId] = useState("")
  const [events, setEvents] = useState([])
  const [selectedTags, setSelectedTags] = useState([])
  const [tagCategories, setTagCategories] = useState([])
  const [publicVisible, setPublicVisible] = useState(true)
  const [leadersOnlyVisible, setLeadersOnlyVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [loadingTags, setLoadingTags] = useState(true)
  const [debugInfo, setDebugInfo] = useState(null)
  const [tagsError, setTagsError] = useState(null)

  const navigate = useNavigate()
  const isLeader = getUserRole() === "leader"

  useEffect(() => {
    // Проверяем авторизацию
    if (!isAuthenticated()) {
      navigate("/login", { state: { from: "/photos/upload" } })
      return
    }

    // Загружаем список событий
    const fetchEvents = async () => {
      setLoadingEvents(true)
      try {
        console.log("Fetching events from:", `${API_URL}/events`)
        const token = localStorage.getItem("token")
        const response = await axios.get(`${API_URL}/events`, {
          headers: {
            "x-auth-token": token,
          },
        })
        console.log("Events response:", response.data)

        if (response.data && Array.isArray(response.data.events)) {
          setEvents(response.data.events)
        } else if (response.data && Array.isArray(response.data.data)) {
          // Альтернативный формат ответа
          setEvents(response.data.data)
        } else {
          console.warn("Unexpected events response format:", response.data)
          setEvents([])
        }
      } catch (err) {
        console.error("Error fetching events:", err)
        setEvents([])
      } finally {
        setLoadingEvents(false)
      }
    }

    // Загружаем список предопределенных тегов
    const fetchTags = async () => {
      setLoadingTags(true)
      setTagsError(null)
      try {
        console.log("Fetching tags from:", `${API_URL}/photo-tags/categories`)
        const token = localStorage.getItem("token")
        const response = await axios.get(`${API_URL}/photo-tags/categories`, {
          headers: {
            "x-auth-token": token,
          },
        })
        console.log("Tags response:", response.data)
        setDebugInfo(JSON.stringify(response.data, null, 2))

        if (response.data && response.data.success && Array.isArray(response.data.data)) {
          setTagCategories(response.data.data)
        } else {
          console.warn("Unexpected tags response format:", response.data)
          setTagCategories([])
          setTagsError("Неожиданный формат ответа от сервера")
        }
      } catch (err) {
        console.error("Error fetching tags:", err)
        setTagCategories([])
        setTagsError(`Ошибка при загрузке тегов: ${err.message}`)
        setDebugInfo(
          JSON.stringify(
            {
              message: err.message,
              response: err.response?.data,
              status: err.response?.status,
              headers: err.response?.headers,
            },
            null,
            2,
          ),
        )

        // Попробуем альтернативный метод получения тегов
        try {
          console.log("Trying alternative method to fetch tags")
          const token = localStorage.getItem("token")

          // Получаем категории напрямую
          const categoriesResponse = await axios.get(`${API_URL}/photo-tags/direct-categories`, {
            headers: {
              "x-auth-token": token,
            },
          })

          if (
            categoriesResponse.data &&
            categoriesResponse.data.success &&
            Array.isArray(categoriesResponse.data.data)
          ) {
            const categories = categoriesResponse.data.data
            console.log("Direct categories:", categories)

            // Преобразуем данные в нужный формат
            const formattedCategories = categories.map((category) => ({
              category_id: category.category_id,
              category_name: category.name,
              tags: [], // Пустой массив тегов, который мы заполним позже
            }))

            // Для каждой категории получаем теги
            for (const category of formattedCategories) {
              try {
                const tagsResponse = await axios.get(`${API_URL}/photo-tags/direct-tags/${category.category_id}`, {
                  headers: {
                    "x-auth-token": token,
                  },
                })

                if (tagsResponse.data && tagsResponse.data.success && Array.isArray(tagsResponse.data.data)) {
                  category.tags = tagsResponse.data.data
                }
              } catch (tagErr) {
                console.error(`Error fetching tags for category ${category.category_id}:`, tagErr)
              }
            }

            console.log("Formatted categories with tags:", formattedCategories)
            setTagCategories(formattedCategories)
            setTagsError("Использован альтернативный метод получения тегов")
          }
        } catch (altErr) {
          console.error("Error with alternative method:", altErr)
          setTagsError(`Ошибка при альтернативном методе загрузки тегов: ${altErr.message}`)
        }
      } finally {
        setLoadingTags(false)
      }
    }

    fetchEvents()
    fetchTags()
  }, [navigate, API_URL])

  // Обработка выбора файла
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)

      // Создаем превью изображения
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  // Обработка выбора/отмены выбора тега
  const handleTagToggle = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

  // Обработка отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!file) {
      setError("Пожалуйста, выберите изображение для загрузки")
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Подготавливаем данные формы
      const formData = new FormData()
      formData.append("image", file) // ВАЖНО: изменено имя поля с "photo" на "image"
      formData.append("title", title)
      formData.append("description", description)
      if (eventId) formData.append("event_id", eventId)
      formData.append("public_visible", publicVisible)
      formData.append("leaders_only_visible", leadersOnlyVisible)

      // Добавляем выбранные теги
      if (selectedTags.length > 0) {
        formData.append("tags", JSON.stringify(selectedTags))
      }

      // Отправляем запрос
      const response = await uploadPhoto(formData)

      if (response.success) {
        setSuccess(true)
        // Очищаем форму
        setTitle("")
        setDescription("")
        setFile(null)
        setPreview(null)
        setEventId("")
        setSelectedTags([])
        setPublicVisible(true)
        setLeadersOnlyVisible(false)

        // Перенаправляем на страницу с фотографиями через 2 секунды
        setTimeout(() => {
          navigate("/photos")
        }, 2000)
      } else {
        setError(response.message || "Не удалось загрузить фотографию")
      }
    } catch (err) {
      console.error("Error uploading photo:", err)
      setError("Ошибка при загрузке фотографии. Пожалуйста, попробуйте позже.")
    } finally {
      setLoading(false)
    }
  }

  // Функция для отображения тегов
  const renderTags = () => {
    if (loadingTags) {
      return <p>Загрузка тегов...</p>
    }

    if (tagsError) {
      return (
        <div className="tags-error">
          <p>{tagsError}</p>
          <button onClick={() => window.location.reload()} className="reload-button">
            Перезагрузить страницу
          </button>
        </div>
      )
    }

    if (tagCategories.length === 0) {
      return <p>Нет доступных тегов. Теги будут добавлены администратором.</p>
    }

    return (
      <div className="tags-container">
        {tagCategories.map((category) => (
          <div key={category.category_id} className="tag-category">
            <h4>{category.category_name}</h4>
            <div className="tag-list">
              {Array.isArray(category.tags) && category.tags.length > 0 ? (
                category.tags.map((tag) => (
                  <div
                    key={tag.tag_id}
                    className={`tag-item ${selectedTags.includes(tag.tag) ? "selected" : ""}`}
                    onClick={() => handleTagToggle(tag.tag)}
                  >
                    {tag.tag}
                  </div>
                ))
              ) : (
                <p>Нет тегов в этой категории</p>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="photo-upload-container">
      <h2>Загрузка новой фотографии</h2>

      {success && <div className="success-message">Фотография успешно загружена! Перенаправление в галерею...</div>}

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="photo-upload-form">
        <div className="form-group">
          <label htmlFor="title">Название:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Введите название фотографии"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Описание:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Введите описание фотографии"
            rows="3"
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="event">Событие (опционально):</label>
          <select
            id="event"
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            disabled={loadingEvents || events.length === 0}
          >
            <option value="">-- Выберите событие --</option>
            {loadingEvents ? (
              <option value="" disabled>
                Загрузка событий...
              </option>
            ) : events.length === 0 ? (
              <option value="" disabled>
                Нет доступных событий
              </option>
            ) : (
              events.map((event) => (
                <option key={event.event_id || event.id} value={event.event_id || event.id}>
                  {event.title} ({new Date(event.start_date || event.date).toLocaleDateString()})
                </option>
              ))
            )}
          </select>
          {events.length === 0 && !loadingEvents && (
            <p className="form-help-text">Нет доступных событий. Создайте событие перед загрузкой фотографий.</p>
          )}
        </div>

        <div className="form-group">
          <label>Теги:</label>
          {renderTags()}
          <div className="selected-tags">
            <p>Выбранные теги: {selectedTags.length > 0 ? selectedTags.join(", ") : "Нет выбранных тегов"}</p>
          </div>
        </div>

        <div className="form-group visibility-options">
          <label>Видимость:</label>
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="publicVisible"
              checked={publicVisible}
              onChange={(e) => setPublicVisible(e.target.checked)}
            />
            <label htmlFor="publicVisible">Публичная</label>
          </div>

          {isLeader && (
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="leadersOnlyVisible"
                checked={leadersOnlyVisible}
                onChange={(e) => setLeadersOnlyVisible(e.target.checked)}
              />
              <label htmlFor="leadersOnlyVisible">Только для лидеров</label>
            </div>
          )}
        </div>

        <div className="form-group file-upload">
          <label htmlFor="photo">Выберите фотографию:</label>
          <input type="file" id="photo" accept="image/*" onChange={handleFileChange} required />

          {preview && (
            <div className="image-preview">
              <img src={preview || "/placeholder.jpg"} alt="Предпросмотр" />
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Загрузка..." : "Загрузить фотографию"}
          </button>
          <button type="button" className="cancel-button" onClick={() => navigate("/photos")}>
            Отмена
          </button>
        </div>
      </form>

      {debugInfo && (
        <div className="debug-info">
          <h3>Отладочная информация:</h3>
          <pre>{debugInfo}</pre>
        </div>
      )}
    </div>
  )
}

export default PhotoUpload
