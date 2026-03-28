import { api } from './api'

export async function cadastrarUsuario({ nome, email, telefone, senha }) {
  const { data } = await api.post('/auth/cadastro', { nome, email, telefone, senha })
  return data // retorna { codigoVerificacao, numeroBo }
}

export async function verificarWhatsapp(telefone) {
  const { data } = await api.get(`/verify/status?phone=${telefone}`)
  if (!data.verificado) throw new Error('Código ainda não confirmado.')
  return data
}

export async function solicitarResetSenha(email) {
  await api.post('/auth/resetsenha/solicitar', { email })
}

export async function confirmarResetSenha({ token, senhanova }) {
  await api.post('/auth/resetsenha/confirmar', { token, senhanova })
}