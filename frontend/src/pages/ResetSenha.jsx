import { useNavigate, useSearchParams } from "react-router-dom";
import { Glass } from "../components/GlassContainer";
import { useState, useMemo } from "react";
import { solicitarResetSenha, confirmarResetSenha } from "../services/authService";
import { Analytics } from '@vercel/analytics/react';

export default function ResetSenha() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const token = useMemo(() => searchParams.get('token'), [searchParams]);

    const [senhanova, setSenhanova] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleRequestLink = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setMessage("")
        try {
            await solicitarResetSenha(email)
            setMessage("Link enviado com sucesso! Verifique seu e-mail.")
        } catch (err) {
            setMessage(err.response?.data?.message || err.message)
        } finally {
            setIsLoading(false)
        }
    }

    const handleResetPassword = async (e) => {
        e.preventDefault()
        if (senhanova !== confirmPassword) {
            setMessage("As senhas não coincidem.")
            return
        }
        setIsLoading(true)
        setMessage("")
        try {
            await confirmarResetSenha({ token, senhanova })
            setMessage("Senha alterada com sucesso! Redirecionando...")
            setTimeout(() => navigate("/login"), 2500)
        } catch (err) {
            setMessage(err.response?.data?.message || err.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <div className='bg-[#0A0A0A] min-h-screen overflow-x-hidden relative flex items-center justify-center font-sans text-white'>
                <div className='absolute z-0 -top-40 -right-20 w-125 h-125 bg-[#00FFFF]/70 rounded-full blur-[200px]' />
                <div className='absolute z-0 bottom-0 left-0 w-96 h-96 bg-[#AA00FF]/15 rounded-full blur-[150px]' />

                <div className="relative z-10 w-full max-w-5xl px-6 flex flex-col lg:flex-row items-center justify-center gap-16">

                    {/* ── Coluna esquerda: branding (desktop only) ── */}
                    <div className="hidden lg:flex flex-col gap-6 flex-1 max-w-sm">
                        <h2 className="text-white text-4xl font-bold leading-tight">
                            {token ? 'Crie uma' : 'Recupere sua'}<br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FFFF] to-[#AA00FF]">
                                {token ? 'nova senha' : 'senha'}
                            </span>
                        </h2>
                        <p className="text-[#E0E0E0]/50 text-base leading-relaxed">
                            {token
                                ? 'Escolha uma senha forte e segura para proteger sua conta.'
                                : 'Enviaremos um link de redefinição para o seu e-mail cadastrado.'}
                        </p>
                        <a href="/login" className="text-[#E0E0E0]/40 text-sm hover:text-white transition-colors flex items-center gap-2 w-fit">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M19 12H5M5 12l7-7M5 12l7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Voltar para o login
                        </a>
                    </div>

                    {/* ── Card ── */}
                    <div className="justify-items-center w-full max-w-md h-auto">
                        <div className="relative w-full">
                            <Glass cornerRadius="40px" blur="16px" bgOpacity={0.15}>
                                <div className="p-7 pt-13">
                                    <h1 className="flex justify-center text-center font-bold text-3xl mb-8">
                                        {token ? "Nova Senha" : "Redefinir Senha"}
                                    </h1>

                                    {token ? (
                                        <form className="flex flex-col gap-4" onSubmit={handleResetPassword}>
                                            <input
                                                className="outline-0 p-3 pt-4 w-full rounded-full bg-[#3B3B3B] h-12 text-white placeholder:text-[#E0E0E0]/50 focus:ring-2 focus:ring-[#00FFFF]/50 transition-all"
                                                placeholder="Nova senha"
                                                type="password"
                                                value={senhanova}
                                                onChange={(e) => setSenhanova(e.target.value)}
                                                required
                                            />
                                            <input
                                                className="outline-0 p-3 pt-4 w-full rounded-full bg-[#3B3B3B] h-12 text-white placeholder:text-[#E0E0E0]/50 focus:ring-2 focus:ring-[#00FFFF]/50 transition-all"
                                                placeholder="Confirme a nova senha"
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                required
                                            />
                                            {message && <p className="text-sm text-center text-[#00FFFF]">{message}</p>}
                                            <button
                                                type="submit"
                                                disabled={isLoading}
                                                className="mt-4 w-full h-12 rounded-full bg-[#AA00FF] font-bold hover:shadow-[0_0_20px_rgba(170,0,255,0.5)] transition-shadow disabled:opacity-50"
                                            >
                                                {isLoading ? "Salvando..." : "Alterar Senha"}
                                            </button>
                                        </form>
                                    ) : (
                                        <form className="flex flex-col gap-4" onSubmit={handleRequestLink}>
                                            <input
                                                className="outline-0 p-3 pt-4 w-full rounded-full bg-[#3B3B3B] h-12 text-white placeholder:text-[#E0E0E0]/50 focus:ring-2 focus:ring-[#00FFFF]/50 transition-all"
                                                placeholder="Digite seu e-mail cadastrado"
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                            />
                                            {message && <p className="text-sm text-center text-[#00FFFF]">{message}</p>}
                                            <button
                                                type="submit"
                                                disabled={isLoading}
                                                className="mt-4 w-full h-12 rounded-full bg-[#AA00FF] font-bold hover:shadow-[0_0_20px_rgba(170,0,255,0.5)] transition-shadow disabled:opacity-50"
                                            >
                                                {isLoading ? "Enviando..." : "Enviar link"}
                                            </button>
                                        </form>
                                    )}

                                    {/* Voltar — mobile only */}
                                    <div className="mt-6 flex justify-center lg:hidden">
                                        <a href="/login" className="text-[#E0E0E0]/70 text-sm hover:text-white transition-colors">
                                            Voltar para o login
                                        </a>
                                    </div>
                                </div>
                            </Glass>
                        </div>
                    </div>
                </div>
            </div>
            <Analytics />
        </>
    )
}