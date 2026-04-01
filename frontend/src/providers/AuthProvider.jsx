import { useState, useCallback, useEffect } from 'react'
import { api, setLogoutHandler, setAccessToken, getAccessToken } from '../services/api'
import { AuthContext } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 < Date.now()
  } catch {
    return true
  }
}

function loadUserFromStorage() {
  const savedUser = localStorage.getItem('user')
  if (!savedUser) return null
  try {
    return JSON.parse(savedUser)
  } catch {
    localStorage.removeItem('user')
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isIniciando, setIsIniciando] = useState(true)

  const navigate = useNavigate()

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout')
    } catch (_) {}
    localStorage.removeItem('user')
    setAccessToken(null)
    setUser(null)
    navigate('/login')
  }, [navigate])

  const login = useCallback(async ({ email, senha }) => {
    const { data } = await api.post('/auth/login', { email, senha })

    setAccessToken(data.accessToken) // ← memória, não localStorage
    localStorage.setItem('user', JSON.stringify({ email: data.email }))
    setUser({ email: data.email })

    return data
  }, [])

  useEffect(() => {
    setLogoutHandler(logout)
  }, [logout])

  useEffect(() => {
    async function tryRefresh() {
      const savedUser = loadUserFromStorage()

      if (!savedUser) {
        setIsIniciando(false)
        return
      }

      try {
        const { data } = await api.post('/auth/refresh')
        setAccessToken(data.accessToken)

        const updatedUser = { email: data.email ?? savedUser.email }
        localStorage.setItem('user', JSON.stringify(updatedUser))
        setUser(updatedUser)
      } catch {
        // só limpa, sem redirecionar — evita loop
        localStorage.removeItem('user')
        setUser(null)
      } finally {
        setIsIniciando(false)
      }
    }

    tryRefresh()
  }, [])

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