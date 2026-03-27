import { useState, useCallback, useEffect } from 'react'
import { api, setLogoutHandler } from '../services/api'
import { AuthContext } from '../hooks/useAuth'

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

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
  }, [])

  useEffect(() => {
    setLogoutHandler(logout)
  }, [logout])

  const login = useCallback(async ({ email, senha }) => {
    const { data } = await api.post('/auth/login', { email, senha })

    const { accessToken, email: userEmail } = data

    localStorage.setItem('token', accessToken)
    localStorage.setItem('user', JSON.stringify({ email: userEmail }))
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`

    setUser({ email: userEmail })
  }, [])

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
  }

  return (
      <AuthContext.Provider value={value}>
        {children}
      </AuthContext.Provider>
  )
}