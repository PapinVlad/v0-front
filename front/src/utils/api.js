import axios from "axios"

// Создаем экземпляр axios с базовым URL
const api = axios.create({
  baseURL: "http://localhost:5000/api",
})

// Добавляем перехватчик запросов для добавления токена аутентификации
api.interceptors.request.use(
  (config) => {
    // Получаем токен из localStorage
    const token = localStorage.getItem("token")

    // Добавляем отладочную информацию
    console.log(`API Request: ${config.method.toUpperCase()} ${config.baseURL}${config.url}`)

    // Проверяем, является ли маршрут публичным
    const isPublicRoute = config.url.startsWith("/announcements") || config.url.startsWith("/auth")

    // Если токен существует, добавляем его в заголовки
    if (token) {
      config.headers["x-auth-token"] = token
      console.log("API Request: Token added to headers")
    } else if (!isPublicRoute) {
      console.log("API Request: No token found for protected route")
    }

    return config
  },
  (error) => {
    console.error("API Request Error:", error)
    return Promise.reject(error)
  },
)

// Добавляем перехватчик ответов для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

// Получение списка фотографий
export const getPhotos = async (endpoint = "") => {
  try {
    console.log(`Fetching photos with endpoint: /photos${endpoint}`)
    const response = await api.get(`/photos${endpoint}`)
    console.log("Photos API response:", response.data)

    // Обеспечиваем стандартный формат ответа
    return {
      success: true,
      data: response.data.data || response.data.photos || [],
      message: response.data.message || "",
    }
  } catch (error) {
    console.error("API Error in getPhotos:", error.response?.data || error.message)
    return {
      success: false,
      data: [],
      message: error.response?.data?.message || "Error fetching photos",
    }
  }
}

// Получение фотографии по ID
export const getPhotoById = async (id) => {
  try {
    const response = await api.get(`/photos/${id}`)
    return {
      success: true,
      data: response.data.data || response.data.photo,
      message: response.data.message || "",
    }
  } catch (error) {
    console.error("API Error in getPhotoById:", error.response?.data || error.message)
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || "Error fetching photo",
    }
  }
}

// Загрузка новой фотографии
export const uploadPhoto = async (formData) => {
  try {
    console.log("Uploading photo with formData:")
    // Выводим содержимое formData для отладки
    for (const pair of formData.entries()) {
      console.log(pair[0] + ": " + (pair[0] === "image" ? "File object" : pair[1]))
    }

    const response = await api.post("/photos", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return {
      success: true,
      data: response.data.data || response.data.photo,
      message: response.data.message || "Photo uploaded successfully",
    }
  } catch (error) {
    console.error("API Error in uploadPhoto:", error.response?.data || error.message)
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || "Error uploading photo",
    }
  }
}

// Обновление фотографии
export const updatePhoto = async (photoId, formData) => {
  try {
    if (!photoId) {
      throw new Error("Photo ID is required");
    }
    const response = await api.put(`/photos/${photoId}`, formData, {
      headers: {
        "x-auth-token": localStorage.getItem("token"),
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("API Error in updatePhoto:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Удаление фотографии
export const deletePhoto = async (photoId) => {
  try {
    if (!photoId) {
      throw new Error("Photo ID is required");
    }
    const response = await api.delete(`/photos/${photoId}`, {
      headers: {
        "x-auth-token": localStorage.getItem("token"), // Если используете токен
      },
    });
    return response.data;
  } catch (error) {
    console.error("API Error in deletePhoto:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Получение списка событий
export const getEvents = async () => {
  try {
    const response = await api.get("/events")
    return {
      success: true,
      data: response.data.data || response.data.events || [],
      message: response.data.message || "",
    }
  } catch (error) {
    console.error("API Error in getEvents:", error.response?.data || error.message)
    return {
      success: false,
      data: [],
      message: error.response?.data?.message || "Error fetching events",
    }
  }
}

export default api
