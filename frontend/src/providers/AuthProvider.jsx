import { useState, useCallback, useEffect } from 'react'
import { api, setLogoutHandler } from '../services/api'
import { AuthContext } from '../hooks/useAuth'

function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 < Date.now()
  } catch {
    return true
  }
}

function loadUserFromStorage() {
  const token = localStorage.getItem('token')
  const savedUser = localStorage.getItem('user')

  if (!token || !savedUser) return null

  try {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    return JSON.parse(savedUser)
  } catch {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUserFromStorage)
  const [isIniciando, setIsIniciando] = useState(true)

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
  }, [])

  const login = useCallback(async ({ email, senha }) => {
    const { data } = await api.post('/auth/login', { email, senha })

    const { accessToken, email: userEmail } = data

    localStorage.setItem('token', accessToken)
    localStorage.setItem('user', JSON.stringify({ email: userEmail }))
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`

    setUser({ email: userEmail })

    return data;
  }, [])

  useEffect(() => {
    setLogoutHandler(logout)
  }, [logout])

  useEffect(() => {
    async function tryRefresh() {
      const token = localStorage.getItem('token')
      if (!token) {
        setIsIniciando(false)
        return
      }

      if (isTokenExpired(token)) {
        try {
          const { data } = await api.post('/auth/refresh')
          localStorage.setItem('token', data.token)
          api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`

          if (data.email) {
            const updatedUser = { email: data.email }
            localStorage.setItem('user', JSON.stringify(updatedUser))
            setUser(updatedUser)
          }
        } catch {
          logout()
        }
      }

      setIsIniciando(false)
    }

    tryRefresh()
  }, [logout])

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
  }

  if (isIniciando) return null

  return (
      <AuthContext.Provider value={value}>
        {children}
      </AuthContext.Provider>
  )
}