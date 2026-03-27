import { api } from './api'

export async function cadastrarUsuario({ nome, email, telefone, senha }) {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/cadastro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, email, telefone, senha })
  })

  if (!response.ok) throw new Error('Erro ao cadastrar.')

  return response.json() // retorna { codigoVerificacao, numeroBo }
}

export async function verificarWhatsapp(telefone) {
  const { data } = await api.get(`/verify/status?phone=${telefone}`)

  if (!data.verificado) throw new Error('Código ainda não confirmado.')

  return data
}

export async function solicitarResetSenha(email) {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/resetsenha/solicitar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  })

  if (!response.ok) throw new Error('Erro ao solicitar link.')
}

export async function confirmarResetSenha({ token, senhanova }) {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/resetsenha/confirmar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, senhanova })
  })

  if (!response.ok) throw new Error('Token inválido ou expirado.')
}