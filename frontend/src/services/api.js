import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // envia o cookie httpOnly do refresh token automaticamente
})

// Fila de requisições que chegaram enquanto o refresh estava em andamento
let isRefreshing = false
let failedQueue = []

function processQueue(error, token = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token)
  })
  failedQueue = []
}

// Referência externa para o logout — injetada pelo AuthProvider
let onLogout = null

export function setLogoutHandler(fn) {
  onLogout = fn
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Ignora erros que não sejam 401 ou que já tentaram refresh
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    // Evita loop infinito na própria rota de refresh
    if (originalRequest.url?.includes('/auth/refresh')) {
      onLogout?.()
      return Promise.reject(error)
    }

    // Se já está fazendo refresh, enfileira a requisição
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then((token) => {
        originalRequest.headers['Authorization'] = `Bearer ${token}`
        return api(originalRequest)
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      // O cookie httpOnly é enviado automaticamente via withCredentials
      const { data } = await api.post('/auth/refresh')
      const { token } = data

      localStorage.setItem('token', token)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      originalRequest.headers['Authorization'] = `Bearer ${token}`

      processQueue(null, token)
      return api(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError, null)
      onLogout?.()
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)