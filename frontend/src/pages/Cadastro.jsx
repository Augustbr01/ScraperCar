import React, { useCallback, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { cadastrarUsuario } from "../services/authService.js"
import { Analytics } from '@vercel/analytics/react'
import VerificacaoWhatsapp from "./VerifyPhone.jsx"

const styles = `
  @keyframes cadastroFadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .cad-fade-1 { opacity: 0; animation: cadastroFadeUp 0.6s 0.1s ease forwards; }
  .cad-fade-2 { opacity: 0; animation: cadastroFadeUp 0.6s 0.2s ease forwards; }
  .cad-fade-3 { opacity: 0; animation: cadastroFadeUp 0.6s 0.3s ease forwards; }
  .cad-fade-card { opacity: 0; animation: cadastroFadeUp 0.7s 0.25s ease forwards; }

  .cad-input {
    width: 100%;
    padding: 13px 16px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: 12px;
    color: #f0f0f8;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
    outline: none;
  }
  .cad-input::placeholder { color: rgba(255,255,255,0.25); }
  .cad-input:focus {
    border-color: rgba(139,92,246,0.5);
    background: rgba(255,255,255,0.07);
    box-shadow: 0 0 0 3px rgba(139,92,246,0.12);
  }
  .cad-input:disabled { opacity: 0.6; cursor: not-allowed; }

  .cad-btn-primary {
    width: 100%;
    padding: 14px;
    border-radius: 12px;
    border: none;
    cursor: pointer;
    font-family: 'Syne', sans-serif;
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 0.02em;
    background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%);
    color: #fff;
    position: relative;
    overflow: hidden;
    transition: transform 0.15s, box-shadow 0.15s;
    box-shadow: 0 4px 24px rgba(124,58,237,0.4);
  }
  .cad-btn-primary::after {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
    pointer-events: none;
  }
  .cad-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 8px 32px rgba(124,58,237,0.55); }
  .cad-btn-primary:active { transform: translateY(0); }
  .cad-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
`

function FieldLabel({ children }) {
  return (
    <label style={{
      display: 'block', fontSize: '12px', fontWeight: 500,
      letterSpacing: '0.05em', color: 'rgba(240,240,248,0.45)',
      textTransform: 'uppercase', marginBottom: '8px',
      fontFamily: "'DM Sans', sans-serif",
    }}>{children}</label>
  )
}

export default function Cadastro() {
  const navigate = useNavigate()

  const [validandoNumero, setValidandoNumero] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')

  const [codigoVerificacao, setCodigoVerificacao] = useState('')
  const [numeroBo, setNumeroBo] = useState('')

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    setCarregando(true)
    setErro('')
    try {
      const data = await cadastrarUsuario({ nome, email, telefone, senha })
      setCodigoVerificacao(data.codigoVerificacao)
      setNumeroBo(data.numeroBo)
      setValidandoNumero(true)
    } catch (err) {
      setErro(err.response?.data?.error || err.error || 'Erro inesperado. Tente novamente.')
    } finally {
      setCarregando(false)
    }
  }, [nome, email, telefone, senha])

  if (validandoNumero) {
    return (
      <VerificacaoWhatsapp
        telefone={telefone}
        codigoVerificacao={codigoVerificacao}
        numeroBo={numeroBo}
        onSucesso={() => navigate('/dashboard')}
        onVoltar={() => setValidandoNumero(false)}
      />
    )
  }

  return (
    <>
      <style>{styles}</style>

      {/* Mesh background */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        background: `
          radial-gradient(ellipse 70% 45% at 80% 100%, rgba(109,40,217,0.45) 0%, transparent 70%),
          radial-gradient(ellipse 60% 40% at 20% 10%, rgba(45,212,191,0.3) 0%, transparent 65%),
          #07080f
        `
      }} />

      {/* Page */}
      <div style={{
        position: 'relative', zIndex: 1,
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: '1fr 520px',
        alignItems: 'center',
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 64px',
        gap: '80px',
      }} className="max-lg:flex max-lg:flex-col max-lg:px-6 max-lg:py-12 max-lg:gap-10 max-lg:justify-center">

        {/* ── Left hero ── */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>

          {/* Back link */}
          <div className="cad-fade-1" style={{ marginBottom: '40px' }}>
            <Link to="/login" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              fontSize: '14px', fontWeight: 500, color: '#2dd4bf',
              textDecoration: 'none', fontFamily: "'DM Sans', sans-serif",
              transition: 'color 0.2s',
            }}>
              <svg width="8" height="13" viewBox="0 0 8 13" fill="none">
                <path d="M7 1L1 6.5l6 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Voltar para o login
            </Link>
          </div>

          {/* Logo */}
          <div className="cad-fade-2" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '48px' }}>
            <svg viewBox="0 0 32 32" fill="none" width="32" height="32">
              <rect x="2" y="12" width="28" height="14" rx="4" fill="none" stroke="url(#cadLg)" strokeWidth="2"/>
              <path d="M8 12 L11 6 L21 6 L24 12" stroke="url(#cadLg)" strokeWidth="2" strokeLinejoin="round" fill="none"/>
              <circle cx="9" cy="22" r="3" fill="url(#cadLg2)"/>
              <circle cx="23" cy="22" r="3" fill="url(#cadLg2)"/>
              <defs>
                <linearGradient id="cadLg" x1="2" y1="6" x2="30" y2="26" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#a78bfa"/><stop offset="1" stopColor="#2dd4bf"/>
                </linearGradient>
                <linearGradient id="cadLg2" x1="6" y1="19" x2="26" y2="25" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#a78bfa"/><stop offset="1" stopColor="#2dd4bf"/>
                </linearGradient>
              </defs>
            </svg>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '18px', letterSpacing: '-0.02em', color: '#f0f0f8' }}>
              ScraperCar
            </span>
          </div>

          {/* Headline */}
          <h1 className="cad-fade-2" style={{
            fontFamily: "'Manjari', sans-serif",
            fontSize: 'clamp(38px, 4vw, 62px)',
            fontWeight: 800, lineHeight: 1.06, letterSpacing: '-0.03em',
            color: '#f0f0f8', marginBottom: '16px',
          }}>
            Criar conta{' '}
            <span style={{
              background: 'linear-gradient(135deg, #a78bfa, #2dd4bf)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>grátis</span>
          </h1>

          <p className="cad-fade-3" style={{
            fontSize: '16px', lineHeight: 1.7,
            color: 'rgba(240,240,248,0.45)', maxWidth: '380px',
            fontFamily: "'DM Sans', sans-serif",
          }}>
            Comece a receber alertas hoje mesmo. Configure filtros, defina seu orçamento e seja o primeiro a saber quando seu carro ideal aparecer.
          </p>
        </div>

        {/* Accent divider — desktop only */}
        <div className="max-lg:hidden" style={{
          width: '1px', height: '340px',
          background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.08) 20%, rgba(255,255,255,0.08) 80%, transparent)',
          position: 'absolute', left: '50%', top: '50%', transform: 'translateY(-50%)',
        }} />

        {/* ── Right card ── */}
        <div className="cad-fade-card">
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '24px',
            padding: '44px 40px',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.03) inset, 0 32px 80px rgba(0,0,0,0.5), 0 0 120px rgba(139,92,246,0.08)',
            position: 'relative', overflow: 'hidden',
          }}>
            {/* Top highlight */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15) 40%, rgba(139,92,246,0.3) 60%, transparent)',
            }} />

            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '26px', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: '6px', color: '#f0f0f8' }}>
              Criar conta
            </div>
            <div style={{ fontSize: '13.5px', color: 'rgba(240,240,248,0.45)', marginBottom: '32px', fontFamily: "'DM Sans', sans-serif" }}>
              Preencha os dados abaixo para começar ✦
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <FieldLabel>Nome completo</FieldLabel>
                <input className="cad-input" type="text" placeholder="João Silva"
                  value={nome} onChange={e => setNome(e.target.value)} disabled={carregando} required />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <FieldLabel>E-mail</FieldLabel>
                <input className="cad-input" type="email" placeholder="seu@email.com"
                  value={email} onChange={e => setEmail(e.target.value)} disabled={carregando} required />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <FieldLabel>Telefone (WhatsApp)</FieldLabel>
                <input className="cad-input" type="tel" placeholder="+55 11 9 0000-0000"
                  value={telefone} onChange={e => setTelefone(e.target.value)} disabled={carregando} required />
              </div>

              <div style={{ marginBottom: '28px' }}>
                <FieldLabel>Senha</FieldLabel>
                <input className="cad-input" type="password" placeholder="••••••••"
                  value={senha} onChange={e => setSenha(e.target.value)} disabled={carregando} required />
              </div>

              {erro && (
                <div style={{ marginBottom: '16px', textAlign: 'center' }}>
                  <span style={{ color: '#f87171', fontSize: '14px', fontFamily: "'DM Sans', sans-serif" }}>{erro}</span>
                </div>
              )}

              <button type="submit" className="cad-btn-primary" disabled={carregando}>
                {carregando ? 'Criando conta...' : 'Criar minha conta'}
              </button>
            </form>

            {/* Terms */}
            <p style={{
              fontSize: '11.5px', color: 'rgba(240,240,248,0.35)', textAlign: 'center',
              marginTop: '20px', lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif",
            }}>
              Ao criar sua conta, você aceita os{' '}
              <a href="#" style={{ color: '#2dd4bf', textDecoration: 'none' }}>Termos de Uso</a>
              {' '}e a{' '}
              <a href="#" style={{ color: '#2dd4bf', textDecoration: 'none' }}>Política de Privacidade</a>.
            </p>

            {/* Sign in row */}
            <div style={{ textAlign: 'center', fontSize: '13.5px', color: 'rgba(240,240,248,0.45)', marginTop: '16px', fontFamily: "'DM Sans', sans-serif" }}>
              Já tem uma conta?{' '}
              <Link to="/login" style={{ color: '#2dd4bf', textDecoration: 'none', fontWeight: 500 }}>
                Entrar →
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Analytics />
    </>
  )
}
