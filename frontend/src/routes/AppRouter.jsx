import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Login from '../pages/Login'
import Dashboard from '../pages/Dashboard'
import Cadastro from '../pages/Cadastro'
import ResetSenha from "../pages/ResetSenha.jsx";

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" />
}

function CatchAll() {
    const { isAuthenticated } = useAuth()
    return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} />
}


export function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/login' element={<Login />} />
                <Route path='/cadastro' element={<Cadastro />} />
                <Route path='/resetsenha' element={<ResetSenha />} />
                <Route path="/dashboard" element={
                    <PrivateRoute><Dashboard /></PrivateRoute>
                }/>
                <Route path='*' element={<CatchAll />} />
            </Routes>
        </BrowserRouter>
    )
}

