import { useCallback, useState } from "react"
import { useAuth } from "../hooks/useAuth"
import { Link, useNavigate } from "react-router-dom"
import { gerarCodigoVerificacao } from "../services/authService.js"
import { Analytics } from '@vercel/analytics/react'
import VerificacaoWhatsapp from "./VerifyPhone.jsx"

const styles = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .login-fade-1 { opacity: 0; animation: fadeUp 0.6s 0.1s ease forwards; }
  .login-fade-2 { opacity: 0; animation: fadeUp 0.6s 0.2s ease forwards; }
  .login-fade-3 { opacity: 0; animation: fadeUp 0.6s 0.3s ease forwards; }
  .login-fade-4 { opacity: 0; animation: fadeUp 0.6s 0.4s ease forwards; }
  .login-fade-5 { opacity: 0; animation: fadeUp 0.6s 0.5s ease forwards; }
  .login-fade-card { opacity: 0; animation: fadeUp 0.7s 0.35s ease forwards; }

  .login-input {
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
  .login-input::placeholder { color: rgba(255,255,255,0.25); }
  .login-input:focus {
    border-color: rgba(139,92,246,0.5);
    background: rgba(255,255,255,0.07);
    box-shadow: 0 0 0 3px rgba(139,92,246,0.12);
  }
  .login-input:disabled { opacity: 0.6; cursor: not-allowed; }

  .login-btn-primary {
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
  .login-btn-primary::after {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
    pointer-events: none;
  }
  .login-btn-primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 32px rgba(124,58,237,0.55);
  }
  .login-btn-primary:active { transform: translateY(0); }
  .login-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

`

function Login() {
    const [email, setEmail] = useState('')
    const [senha, setSenha] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [validandoNumero, setValidandoNumero] = useState()
    const [telefone, setTelefone] = useState('')
    const [codigoVerificacao, setCodigoVerificacao] = useState('')
    const [numeroBo, setNumeroBo] = useState('')

    const { login } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)
        try {
            const dataLogin = await login({ email, senha })
            if (!dataLogin.validPhone) {
                const dataVerify = await gerarCodigoVerificacao()
                setValidandoNumero(true)
                setTelefone(dataVerify.telefone)
                setNumeroBo(dataVerify.numeroBot)
                setCodigoVerificacao(dataVerify.codigo)
            } else {
                navigate('/dashboard')
            }
        } catch {
            setError('Email ou senha inválidos!')
        } finally {
            setIsLoading(false)
        }
    }, [email, senha, login, navigate])

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
                    radial-gradient(ellipse 60% 50% at 15% 80%, rgba(109,40,217,0.55) 0%, transparent 70%),
                    radial-gradient(ellipse 50% 50% at 85% 20%, rgba(45,212,191,0.35) 0%, transparent 65%),
                    radial-gradient(ellipse 40% 40% at 50% 50%, rgba(30,10,60,0.3) 0%, transparent 70%),
                    #07080f
                `
            }} />

            {/* Page layout */}
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

                    {/* Logo */}
                    <div className="login-fade-1" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '56px' }}>
                        <svg viewBox="0 0 32 32" fill="none" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
                            <rect x="2" y="12" width="28" height="14" rx="4" fill="none" stroke="url(#loginLg)" strokeWidth="2"/>
                            <path d="M8 12 L11 6 L21 6 L24 12" stroke="url(#loginLg)" strokeWidth="2" strokeLinejoin="round" fill="none"/>
                            <circle cx="9" cy="22" r="3" fill="url(#loginLg2)"/>
                            <circle cx="23" cy="22" r="3" fill="url(#loginLg2)"/>
                            <defs>
                                <linearGradient id="loginLg" x1="2" y1="6" x2="30" y2="26" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#a78bfa"/>
                                    <stop offset="1" stopColor="#2dd4bf"/>
                                </linearGradient>
                                <linearGradient id="loginLg2" x1="6" y1="19" x2="26" y2="25" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#a78bfa"/>
                                    <stop offset="1" stopColor="#2dd4bf"/>
                                </linearGradient>
                            </defs>
                        </svg>
                        <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '18px', letterSpacing: '-0.02em', color: '#f0f0f8' }}>
                            ScraperCar
                        </span>
                    </div>

                    {/* Eyebrow */}
                    <p className="login-fade-2" style={{
                        fontSize: '12px', fontWeight: 500, letterSpacing: '0.18em',
                        textTransform: 'uppercase', color: '#2dd4bf', marginBottom: '20px',
                        fontFamily: "'DM Sans', sans-serif"
                    }}>
                        Monitoramento inteligente
                    </p>

                    {/* Headline */}
                    <h1 className="login-fade-3" style={{
                        fontFamily: "'Manjari', sans-serif",
                        fontSize: 'clamp(42px, 4.5vw, 68px)',
                        fontWeight: 800,
                        lineHeight: 1.05,
                        letterSpacing: '-0.03em',
                        marginBottom: '24px',
                        color: '#f0f0f8',
                    }}>
                        Seja o primeiro a<br/>
                        <span style={{
                            background: 'linear-gradient(135deg, #a78bfa, #2dd4bf)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}>
                            encontrar seu carro
                        </span>
                    </h1>

                    {/* Subtext */}
                    <p className="login-fade-4" style={{
                        fontSize: '16px', lineHeight: 1.7,
                        color: 'rgba(240,240,248,0.45)',
                        maxWidth: '420px', marginBottom: '48px',
                        fontFamily: "'DM Sans', sans-serif",
                    }}>
                        Crie alertas inteligentes e receba notificações no WhatsApp assim que aparecerem veículos com o perfil exato que você procura.
                    </p>

                    {/* Features */}
                    <div className="login-fade-5" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {[
                            {
                                icon: (
                                    <svg viewBox="0 0 18 18" fill="none" width="18" height="18">
                                        <path d="M9 1C5 1 2 4 2 8c0 3 1.8 5.6 4.5 6.7L9 17l2.5-2.3C14.2 13.6 16 11 16 8c0-4-3-7-7-7z" stroke="#2dd4bf" strokeWidth="1.5" strokeLinejoin="round"/>
                                        <circle cx="9" cy="8" r="2" fill="#2dd4bf"/>
                                    </svg>
                                ),
                                text: 'Notificações instantâneas via WhatsApp'
                            },
                            {
                                icon: (
                                    <svg viewBox="0 0 18 18" fill="none" width="18" height="18">
                                        <circle cx="8" cy="8" r="5.5" stroke="#a78bfa" strokeWidth="1.5"/>
                                        <path d="M12 12 L16 16" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round"/>
                                        <path d="M5.5 8H10.5M8 5.5V10.5" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round"/>
                                    </svg>
                                ),
                                text: 'Filtros por marca, modelo, ano e preço'
                            },
                            {
                                icon: (
                                    <svg viewBox="0 0 18 18" fill="none" width="18" height="18">
                                        <rect x="2" y="3" width="14" height="12" rx="2.5" stroke="#fbbf24" strokeWidth="1.5"/>
                                        <path d="M6 7H12M6 10H10" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round"/>
                                    </svg>
                                ),
                                text: 'Gerencie múltiplos alertas simultâneos'
                            },
                        ].map(({ icon, text }) => (
                            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                <div style={{
                                    width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: 'rgba(255,255,255,0.06)',
                                    border: '1px solid rgba(255,255,255,0.09)',
                                }}>
                                    {icon}
                                </div>
                                <span style={{ fontSize: '14px', color: 'rgba(240,240,248,0.75)', fontFamily: "'DM Sans', sans-serif" }}>
                                    {text}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Accent divider — desktop only */}
                <div className="max-lg:hidden" style={{
                    width: '1px', height: '340px',
                    background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.08) 20%, rgba(255,255,255,0.08) 80%, transparent)',
                    position: 'absolute', left: '50%', top: '50%', transform: 'translateY(-50%)',
                }} />

                {/* ── Right card ── */}
                <div className="login-fade-card">
                    <div style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '24px',
                        padding: '44px 40px',
                        backdropFilter: 'blur(24px)',
                        WebkitBackdropFilter: 'blur(24px)',
                        boxShadow: '0 0 0 1px rgba(255,255,255,0.03) inset, 0 32px 80px rgba(0,0,0,0.5), 0 0 120px rgba(139,92,246,0.08)',
                        position: 'relative',
                        overflow: 'hidden',
                    }}>
                        {/* Top highlight */}
                        <div style={{
                            position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15) 40%, rgba(139,92,246,0.3) 60%, transparent)',
                        }} />

                        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '26px', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: '6px', color: '#f0f0f8' }}>
                            Entrar
                        </div>
                        <div style={{ fontSize: '13.5px', color: 'rgba(240,240,248,0.45)', marginBottom: '32px', fontFamily: "'DM Sans', sans-serif" }}>
                            Bem-vindo de volta ✦
                        </div>

                        <form onSubmit={handleSubmit}>
                            {/* Email field */}
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{
                                    display: 'block', fontSize: '12px', fontWeight: 500,
                                    letterSpacing: '0.05em', color: 'rgba(240,240,248,0.45)',
                                    textTransform: 'uppercase', marginBottom: '8px',
                                    fontFamily: "'DM Sans', sans-serif",
                                }}>E-mail</label>
                                <input
                                    className="login-input"
                                    type="email"
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoading}
                                    required
                                />
                            </div>

                            {/* Password field */}
                            <div style={{ marginBottom: '8px' }}>
                                <label style={{
                                    display: 'block', fontSize: '12px', fontWeight: 500,
                                    letterSpacing: '0.05em', color: 'rgba(240,240,248,0.45)',
                                    textTransform: 'uppercase', marginBottom: '8px',
                                    fontFamily: "'DM Sans', sans-serif",
                                }}>Senha</label>
                                <input
                                    className="login-input"
                                    type="password"
                                    placeholder="••••••••"
                                    value={senha}
                                    onChange={(e) => setSenha(e.target.value)}
                                    disabled={isLoading}
                                    required
                                />
                            </div>

                            {/* Forgot password */}
                            <Link to="/resetsenha" style={{
                                display: 'block', textAlign: 'right',
                                fontSize: '12.5px', color: '#8b5cf6',
                                textDecoration: 'none', marginTop: '-4px', marginBottom: '28px',
                                transition: 'color 0.2s',
                            }}
                                onMouseEnter={e => e.target.style.color = '#a78bfa'}
                                onMouseLeave={e => e.target.style.color = '#8b5cf6'}
                            >
                                Esqueci minha senha
                            </Link>

                            {/* Error message */}
                            {error && (
                                <div style={{ marginBottom: '16px', textAlign: 'center' }}>
                                    <span style={{ color: '#f87171', fontSize: '14px', fontFamily: "'DM Sans', sans-serif" }}>{error}</span>
                                </div>
                            )}

                            {/* Submit button */}
                            <button type="submit" className="login-btn-primary" disabled={isLoading}>
                                {isLoading ? 'Entrando...' : 'Entrar na conta'}
                            </button>
                        </form>

                        {/* Sign up row */}
                        <div style={{ textAlign: 'center', fontSize: '13.5px', color: 'rgba(240,240,248,0.45)', marginTop: '20px', fontFamily: "'DM Sans', sans-serif" }}>
                            Ainda não tem uma conta?{' '}
                            <Link to="/cadastro" style={{ color: '#2dd4bf', textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }}
                                onMouseEnter={e => e.target.style.color = '#5eead4'}
                                onMouseLeave={e => e.target.style.color = '#2dd4bf'}
                            >
                                Criar conta grátis →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <Analytics />
        </>
    )
}

export default Login
