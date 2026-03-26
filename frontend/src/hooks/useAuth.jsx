import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { api, setLogoutHandler } from '../services/api'

const AuthContext = createContext(null)

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

  // Injeta o logout no interceptor do axios assim que estiver disponível
  useEffect(() => {
    setLogoutHandler(logout)
  }, [logout])

  const login = useCallback(async ({ email, password }) => {
    const { data } = await api.post('/auth/login', { email, password })

    const { token, user } = data

    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`

    setUser(user)
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

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }

  return context
}