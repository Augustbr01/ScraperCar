import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useMemo } from "react";
import { solicitarResetSenha, confirmarResetSenha } from "../services/authService";
import { Analytics } from '@vercel/analytics/react';
import { Link } from "react-router-dom";

const styles = `
  @keyframes resetFadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .reset-fade-1 { opacity: 0; animation: resetFadeUp 0.6s 0.1s ease forwards; }
  .reset-fade-2 { opacity: 0; animation: resetFadeUp 0.6s 0.2s ease forwards; }
  .reset-fade-card { opacity: 0; animation: resetFadeUp 0.7s 0.25s ease forwards; }

  .reset-input {
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
  .reset-input::placeholder { color: rgba(255,255,255,0.25); }
  .reset-input:focus {
    border-color: rgba(139,92,246,0.5);
    background: rgba(255,255,255,0.07);
    box-shadow: 0 0 0 3px rgba(139,92,246,0.12);
  }
  .reset-input:disabled { opacity: 0.6; cursor: not-allowed; }

  .reset-btn-primary {
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
  .reset-btn-primary::after {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
    pointer-events: none;
  }
  .reset-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 8px 32px rgba(124,58,237,0.55); }
  .reset-btn-primary:active { transform: translateY(0); }
  .reset-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
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

export default function ResetSenha() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = useMemo(() => searchParams.get('token'), [searchParams]);

  const [senhanova, setSenhanova] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', isError: false });

  const handleRequestLink = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage({ text: '', isError: false })
    try {
      await solicitarResetSenha(email)
      setMessage({ text: 'Link enviado com sucesso! Verifique seu e-mail.', isError: false })
    } catch (err) {
      setMessage({ text: err.response?.data?.message || err.message, isError: true })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (senhanova !== confirmPassword) {
      setMessage({ text: 'As senhas não coincidem.', isError: true })
      return
    }
    setIsLoading(true)
    setMessage({ text: '', isError: false })
    try {
      await confirmarResetSenha({ token, senhanova })
      setMessage({ text: 'Senha alterada com sucesso! Redirecionando...', isError: false })
      setTimeout(() => navigate("/login"), 2500)
    } catch (err) {
      setMessage({ text: err.response?.data?.message || err.message, isError: true })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <style>{styles}</style>

      {/* Mesh background */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        background: `
          radial-gradient(ellipse 60% 50% at 15% 80%, rgba(109,40,217,0.45) 0%, transparent 70%),
          radial-gradient(ellipse 50% 40% at 85% 20%, rgba(45,212,191,0.3) 0%, transparent 65%),
          #07080f
        `
      }} />

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
          <div className="reset-fade-1" style={{ marginBottom: '40px' }}>
            <Link to="/login" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              fontSize: '14px', fontWeight: 500, color: '#2dd4bf',
              textDecoration: 'none', fontFamily: "'DM Sans', sans-serif",
            }}>
              <svg width="8" height="13" viewBox="0 0 8 13" fill="none">
                <path d="M7 1L1 6.5l6 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Voltar para o login
            </Link>
          </div>

          {/* Logo */}
          <div className="reset-fade-1" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '48px' }}>
            <svg viewBox="0 0 32 32" fill="none" width="32" height="32">
              <rect x="2" y="12" width="28" height="14" rx="4" fill="none" stroke="url(#resetLg)" strokeWidth="2"/>
              <path d="M8 12 L11 6 L21 6 L24 12" stroke="url(#resetLg)" strokeWidth="2" strokeLinejoin="round" fill="none"/>
              <circle cx="9" cy="22" r="3" fill="url(#resetLg2)"/>
              <circle cx="23" cy="22" r="3" fill="url(#resetLg2)"/>
              <defs>
                <linearGradient id="resetLg" x1="2" y1="6" x2="30" y2="26" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#a78bfa"/><stop offset="1" stopColor="#2dd4bf"/>
                </linearGradient>
                <linearGradient id="resetLg2" x1="6" y1="19" x2="26" y2="25" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#a78bfa"/><stop offset="1" stopColor="#2dd4bf"/>
                </linearGradient>
              </defs>
            </svg>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '18px', letterSpacing: '-0.02em', color: '#f0f0f8' }}>
              ScraperCar
            </span>
          </div>

          {/* Headline */}
          <h1 className="reset-fade-2" style={{
            fontFamily: "'Manjari', sans-serif",
            fontSize: 'clamp(38px, 4vw, 62px)',
            fontWeight: 800, lineHeight: 1.06, letterSpacing: '-0.03em',
            color: '#f0f0f8', marginBottom: '16px',
          }}>
            {token ? 'Crie uma' : 'Recupere sua'}<br/>
            <span style={{
              background: 'linear-gradient(135deg, #a78bfa, #2dd4bf)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>{token ? 'nova senha' : 'senha'}</span>
          </h1>

          <p className="reset-fade-2" style={{
            fontSize: '16px', lineHeight: 1.7,
            color: 'rgba(240,240,248,0.45)', maxWidth: '380px',
            fontFamily: "'DM Sans', sans-serif",
          }}>
            {token
              ? 'Escolha uma senha forte e segura para proteger sua conta.'
              : 'Enviaremos um link de redefinição para o seu e-mail cadastrado.'}
          </p>
        </div>

        {/* Accent divider — desktop only */}
        <div className="max-lg:hidden" style={{
          width: '1px', height: '300px',
          background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.08) 20%, rgba(255,255,255,0.08) 80%, transparent)',
          position: 'absolute', left: '50%', top: '50%', transform: 'translateY(-50%)',
        }} />

        {/* ── Right card ── */}
        <div className="reset-fade-card">
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
              {token ? 'Nova Senha' : 'Redefinir Senha'}
            </div>
            <div style={{ fontSize: '13.5px', color: 'rgba(240,240,248,0.45)', marginBottom: '32px', fontFamily: "'DM Sans', sans-serif" }}>
              {token ? 'Escolha uma senha segura ✦' : 'Informe seu e-mail cadastrado ✦'}
            </div>

            {token ? (
              <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <FieldLabel>Nova senha</FieldLabel>
                  <input className="reset-input" type="password" placeholder="••••••••"
                    value={senhanova} onChange={e => setSenhanova(e.target.value)}
                    disabled={isLoading} required />
                </div>
                <div>
                  <FieldLabel>Confirmar nova senha</FieldLabel>
                  <input className="reset-input" type="password" placeholder="••••••••"
                    value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    disabled={isLoading} required />
                </div>

                {message.text && (
                  <p style={{ fontSize: '14px', textAlign: 'center', color: message.isError ? '#f87171' : '#2dd4bf', fontFamily: "'DM Sans', sans-serif" }}>
                    {message.text}
                  </p>
                )}

                <button type="submit" className="reset-btn-primary" disabled={isLoading} style={{ marginTop: '8px' }}>
                  {isLoading ? 'Salvando...' : 'Alterar Senha'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRequestLink} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <FieldLabel>E-mail</FieldLabel>
                  <input className="reset-input" type="email" placeholder="seu@email.com"
                    value={email} onChange={e => setEmail(e.target.value)}
                    disabled={isLoading} required />
                </div>

                {message.text && (
                  <p style={{ fontSize: '14px', textAlign: 'center', color: message.isError ? '#f87171' : '#2dd4bf', fontFamily: "'DM Sans', sans-serif" }}>
                    {message.text}
                  </p>
                )}

                <button type="submit" className="reset-btn-primary" disabled={isLoading} style={{ marginTop: '8px' }}>
                  {isLoading ? 'Enviando...' : 'Enviar link'}
                </button>
              </form>
            )}

            <div style={{ textAlign: 'center', fontSize: '13.5px', color: 'rgba(240,240,248,0.45)', marginTop: '24px', fontFamily: "'DM Sans', sans-serif" }}>
              Lembrou a senha?{' '}
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
