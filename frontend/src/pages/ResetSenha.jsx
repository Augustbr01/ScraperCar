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

  /* ── Mobile-specific overrides ── */
  @media (max-width: 1023px) {
    .reset-page-grid {
      display: flex !important;
      flex-direction: column !important;
      align-items: stretch !important;
      justify-content: flex-start !important;
      min-height: 100vh;
      padding: 0 !important;
      gap: 0 !important;
      max-width: 100% !important;
    }
    .reset-hero-col {
      display: contents !important;
    }
    .reset-back-wrap {
      padding: 20px 24px 0 !important;
      margin-bottom: 0 !important;
    }
    .reset-logo-wrap {
      padding: 16px 24px 0 !important;
      margin-bottom: 0 !important;
    }
    .reset-headline {
      font-size: 30px !important;
      margin-bottom: 8px !important;
      padding: 16px 28px 0 !important;
      line-height: 1.1 !important;
    }
    .reset-subtext {
      font-size: 13.5px !important;
      padding: 0 28px !important;
      margin-bottom: 24px !important;
      max-width: 100% !important;
      line-height: 1.6 !important;
    }
    .reset-card-wrap {
      margin: 0 16px 32px !important;
    }
    .reset-card-inner {
      padding: 28px 22px !important;
      border-radius: 24px !important;
    }
    .reset-card-title {
      font-size: 22px !important;
    }
    .reset-card-subtitle {
      margin-bottom: 20px !important;
    }
  }
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

      <div className="reset-page-grid" style={{
        position: 'relative', zIndex: 1,
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: '1fr 520px',
        alignItems: 'center',
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 64px',
        gap: '80px',
      }}>

        {/* ── Left hero ── */}
        <div className="reset-hero-col" style={{ display: 'flex', flexDirection: 'column' }}>

          {/* Back link */}
          <div className="reset-fade-1 reset-back-wrap" style={{ marginBottom: '40px' }}>
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
          <div className="reset-fade-1 reset-logo-wrap" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '48px' }}>
            <svg width="36" height="35" viewBox="0 0 43 42" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.5623 10.0159C15.6637 10.1308 14.8826 10.4425 14.1939 10.9757C13.6816 11.3612 13.69 11.353 11.456 14.1995C10.3726 15.5858 9.44041 16.7507 9.38162 16.7999C9.33123 16.8409 7.78592 17.2757 5.96346 17.7597C4.04022 18.2683 2.42772 18.744 2.12537 18.8835C1.11756 19.3593 0.302911 20.4175 0.0845512 21.5413C-0.0582222 22.2632 0.0173637 25.3394 0.193731 25.8397C0.496075 26.7093 1.18475 27.5296 1.9826 27.9808C2.46971 28.2515 3.34314 28.4647 3.97303 28.4647C4.32576 28.4647 4.39295 28.4894 4.43494 28.6452C4.46014 28.7519 4.62811 29.121 4.80447 29.4737C5.48475 30.778 6.7865 31.6968 8.34861 31.9593C9.02049 32.0741 9.18006 32.0741 9.86033 31.9593C11.4308 31.705 12.7494 30.778 13.4213 29.4655C13.5976 29.121 13.7656 28.7519 13.7908 28.6452L13.8412 28.4647H21.2486H28.656L28.7064 28.6452C28.7316 28.7519 28.8996 29.121 29.076 29.4737C29.7562 30.7862 31.0664 31.705 32.6369 31.9593C33.3172 32.0741 33.4767 32.0741 34.1486 31.9593C35.8871 31.664 37.3736 30.5073 37.9279 28.9979L38.1127 28.5058L38.9777 28.4565C39.4564 28.4237 40.0191 28.3581 40.2291 28.3007C41.3545 28.0054 42.4043 27.0046 42.8074 25.8397C42.9838 25.3558 43.0594 21.812 42.925 21.1476C42.7234 20.2288 42.1355 19.3183 41.4217 18.8343C41.2369 18.7112 40.2375 18.2272 39.2045 17.7679L37.3316 16.923L35.7275 14.4292C33.9638 11.6812 33.4011 11.0085 32.4521 10.5245C31.3435 9.9503 31.6963 9.97491 24.0201 9.9585C20.2072 9.9503 16.8562 9.97491 16.5623 10.0159ZM30.6465 11.7304C31.3183 11.8452 31.881 12.1159 32.3262 12.5671C32.5193 12.764 33.4431 14.1175 34.3838 15.5858L36.0886 18.2519L38.2135 19.2116C39.3808 19.7366 40.4306 20.2534 40.5398 20.3601C40.6574 20.4667 40.8506 20.7128 40.9681 20.9179C41.1949 21.287 41.1949 21.3034 41.2201 23.1163C41.2537 25.1507 41.1949 25.4706 40.7246 26.0284C40.3131 26.5124 39.8931 26.6847 39.0113 26.7257L38.2554 26.7585L38.1547 26.2417C37.8187 24.5108 36.2398 22.9769 34.3922 22.5995C33.6363 22.4437 33.166 22.4437 32.4017 22.5995C30.4785 23.0015 28.8828 24.5847 28.5972 26.3894L28.5385 26.7421H21.257H13.984L13.8832 26.2499C13.6312 24.9702 12.5646 23.6167 11.3385 23.0179C10.2551 22.5011 9.25564 22.3698 8.13025 22.5995C6.51775 22.9358 5.16561 24.0515 4.56932 25.5362C4.46014 25.7987 4.35096 26.1843 4.31736 26.3894L4.25857 26.7667L3.73787 26.7175C3.08279 26.6683 2.57889 26.414 2.20936 25.9382C1.79783 25.405 1.74744 25.1097 1.78104 23.264C1.80623 21.4183 1.86502 21.205 2.46131 20.6964C2.85604 20.3601 2.99881 20.3108 6.76131 19.3183C8.56697 18.8507 10.1543 18.3995 10.2887 18.3339C10.4482 18.2519 11.3385 17.1855 12.7158 15.4136C13.9084 13.8796 15.0086 12.5261 15.1513 12.4112C15.4957 12.1241 16.2095 11.8124 16.6967 11.7304C17.3013 11.6319 30.0082 11.6319 30.6465 11.7304ZM10.4062 24.4862C11.0025 24.7487 11.6828 25.405 11.9347 25.9628C12.6318 27.505 11.9767 29.2604 10.4314 29.9987C10.0031 30.2038 9.86033 30.2284 9.11287 30.2284C8.38221 30.2284 8.21424 30.2038 7.81111 30.0151C6.2658 29.3097 5.59393 27.505 6.291 25.971C6.62693 25.2163 7.52557 24.4944 8.37381 24.2812C8.91971 24.1499 9.84353 24.2401 10.4062 24.4862ZM34.6777 24.4862C35.9291 25.0358 36.6933 26.4386 36.4498 27.7429C36.181 29.1784 35.0556 30.171 33.6027 30.253C32.5025 30.3104 31.5871 29.9249 30.932 29.1128C30.3021 28.3335 30.109 27.103 30.4869 26.1515C30.8144 25.2983 31.7215 24.5108 32.6453 24.2812C33.1912 24.1499 34.115 24.2401 34.6777 24.4862Z" fill="white"/>
            </svg>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '17px', letterSpacing: '-0.02em', color: '#f0f0f8' }}>
              ScraperCar
            </span>
          </div>

          {/* Headline */}
          <h1 className="reset-fade-2 reset-headline" style={{
            fontFamily: "'Manjari', sans-serif",
            fontSize: 'clamp(30px, 4vw, 62px)',
            fontWeight: 800, lineHeight: 1.06, letterSpacing: '-0.03em',
            color: '#f0f0f8', marginBottom: '16px',
          }}>
            {token ? 'Crie uma' : 'Recupere sua'}{' '}
            <span style={{
              background: 'linear-gradient(135deg, #a78bfa, #2dd4bf)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>{token ? 'nova senha' : 'senha'}</span>
          </h1>

          <p className="reset-fade-2 reset-subtext" style={{
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
        <div className="reset-fade-card reset-card-wrap">
          <div className="reset-card-inner" style={{
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

            <div className="reset-card-title" style={{ fontFamily: "'Syne', sans-serif", fontSize: '26px', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: '6px', color: '#f0f0f8' }}>
              {token ? 'Nova Senha' : 'Redefinir Senha'}
            </div>
            <div className="reset-card-subtitle" style={{ fontSize: '13px', color: 'rgba(240,240,248,0.45)', marginBottom: '28px', fontFamily: "'DM Sans', sans-serif" }}>
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
