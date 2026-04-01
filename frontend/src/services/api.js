import axios from 'axios'

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
})

let isRefreshing = false
let failedQueue = []
let onLogout = null
let accessTokenMemoria = null

export function setLogoutHandler(fn) {
    onLogout = fn
}

export function setAccessToken(token) {
    accessTokenMemoria = token
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
        delete api.defaults.headers.common['Authorization']
    }
}

export function getAccessToken() {
    return accessTokenMemoria
}

function processQueue(error, token = null) {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) reject(error)
        else resolve(token)
    })
    failedQueue = []
}

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        if (error.response?.status !== 401 || originalRequest._retry) {
            return Promise.reject(error)
        }

        // ← substitui aqui
        const rotasIgnoradas = ['/auth/refresh', '/auth/logout', '/auth/login']
        if (rotasIgnoradas.some(rota => originalRequest.url?.includes(rota))) {
            if (originalRequest.url?.includes('/auth/refresh')) {
                onLogout?.()
            }
            return Promise.reject(error)
        }

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject })
            }).then((accessToken) => {
                originalRequest.headers['Authorization'] = `Bearer ${accessToken}`
                return api(originalRequest)
            })
        }

        originalRequest._retry = true
        isRefreshing = true

        try {
            const { data } = await api.post('/auth/refresh')
            const { accessToken } = data
            setAccessToken(accessToken)
            originalRequest.headers['Authorization'] = `Bearer ${accessToken}`
            processQueue(null, accessToken)
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