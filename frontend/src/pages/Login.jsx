import { useCallback, useState } from "react"
import { Glass } from "../components/GlassContainer";
import { useAuth } from "../hooks/useAuth";
import {Link, useNavigate} from "react-router-dom";
import { gerarCodigoVerificacao } from "../services/authService.js";

import { Analytics } from '@vercel/analytics/react';
import VerificacaoWhatsapp from "./VerifyPhone.jsx";

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
                setValidandoNumero(true);
                setTelefone(dataVerify.telefone);
                setNumeroBo(dataVerify.numeroBot);
                setCodigoVerificacao(dataVerify.codigo);
            } else {
                navigate('/dashboard')
            }

        } catch {
            setError('Email ou senha inválidos')
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
            <div className='bg-[#0A0A0A] min-h-screen overflow-x-hidden relative flex items-center justify-center'>
                {/* Glow */}
                <div className='absolute z-0 -top-40 -right-20 w-125 h-125 bg-[#00FFFF]/70 rounded-full blur-[200px]'></div>
                <div className="flex flex-col items-center w-[90%] max-w-md gap-6">
                    <div className="flex items-center gap-3 ">
                        <svg width="40" height="40" viewBox="0 0 43 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16.5623 10.0159C15.6637 10.1308 14.8826 10.4425 14.1939 10.9757C13.6816 11.3612 13.69 11.353 11.456 14.1995C10.3726 15.5858 9.44041 16.7507 9.38162 16.7999C9.33123 16.8409 7.78592 17.2757 5.96346 17.7597C4.04022 18.2683 2.42772 18.744 2.12537 18.8835C1.11756 19.3593 0.302911 20.4175 0.0845512 21.5413C-0.0582222 22.2632 0.0173637 25.3394 0.193731 25.8397C0.496075 26.7093 1.18475 27.5296 1.9826 27.9808C2.46971 28.2515 3.34314 28.4647 3.97303 28.4647C4.32576 28.4647 4.39295 28.4894 4.43494 28.6452C4.46014 28.7519 4.62811 29.121 4.80447 29.4737C5.48475 30.778 6.7865 31.6968 8.34861 31.9593C9.02049 32.0741 9.18006 32.0741 9.86033 31.9593C11.4308 31.705 12.7494 30.778 13.4213 29.4655C13.5976 29.121 13.7656 28.7519 13.7908 28.6452L13.8412 28.4647H21.2486H28.656L28.7064 28.6452C28.7316 28.7519 28.8996 29.121 29.076 29.4737C29.7562 30.7862 31.0664 31.705 32.6369 31.9593C33.3172 32.0741 33.4767 32.0741 34.1486 31.9593C35.8871 31.664 37.3736 30.5073 37.9279 28.9979L38.1127 28.5058L38.9777 28.4565C39.4564 28.4237 40.0191 28.3581 40.2291 28.3007C41.3545 28.0054 42.4043 27.0046 42.8074 25.8397C42.9838 25.3558 43.0594 21.812 42.925 21.1476C42.7234 20.2288 42.1355 19.3183 41.4217 18.8343C41.2369 18.7112 40.2375 18.2272 39.2045 17.7679L37.3316 16.923L35.7275 14.4292C33.9638 11.6812 33.4011 11.0085 32.4521 10.5245C31.3435 9.9503 31.6963 9.97491 24.0201 9.9585C20.2072 9.9503 16.8562 9.97491 16.5623 10.0159ZM30.6465 11.7304C31.3183 11.8452 31.881 12.1159 32.3262 12.5671C32.5193 12.764 33.4431 14.1175 34.3838 15.5858L36.0886 18.2519L38.2135 19.2116C39.3808 19.7366 40.4306 20.2534 40.5398 20.3601C40.6574 20.4667 40.8506 20.7128 40.9681 20.9179C41.1949 21.287 41.1949 21.3034 41.2201 23.1163C41.2537 25.1507 41.1949 25.4706 40.7246 26.0284C40.3131 26.5124 39.8931 26.6847 39.0113 26.7257L38.2554 26.7585L38.1547 26.2417C37.8187 24.5108 36.2398 22.9769 34.3922 22.5995C33.6363 22.4437 33.166 22.4437 32.4017 22.5995C30.4785 23.0015 28.8828 24.5847 28.5972 26.3894L28.5385 26.7421H21.257H13.984L13.8832 26.2499C13.6312 24.9702 12.5646 23.6167 11.3385 23.0179C10.2551 22.5011 9.25564 22.3698 8.13025 22.5995C6.51775 22.9358 5.16561 24.0515 4.56932 25.5362C4.46014 25.7987 4.35096 26.1843 4.31736 26.3894L4.25857 26.7667L3.73787 26.7175C3.08279 26.6683 2.57889 26.414 2.20936 25.9382C1.79783 25.405 1.74744 25.1097 1.78104 23.264C1.80623 21.4183 1.86502 21.205 2.46131 20.6964C2.85604 20.3601 2.99881 20.3108 6.76131 19.3183C8.56697 18.8507 10.1543 18.3995 10.2887 18.3339C10.4482 18.2519 11.3385 17.1855 12.7158 15.4136C13.9084 13.8796 15.0086 12.5261 15.1513 12.4112C15.4957 12.1241 16.2095 11.8124 16.6967 11.7304C17.3013 11.6319 30.0082 11.6319 30.6465 11.7304ZM10.4062 24.4862C11.0025 24.7487 11.6828 25.405 11.9347 25.9628C12.6318 27.505 11.9767 29.2604 10.4314 29.9987C10.0031 30.2038 9.86033 30.2284 9.11287 30.2284C8.38221 30.2284 8.21424 30.2038 7.81111 30.0151C6.2658 29.3097 5.59393 27.505 6.291 25.971C6.62693 25.2163 7.52557 24.4944 8.37381 24.2812C8.91971 24.1499 9.84353 24.2401 10.4062 24.4862ZM34.6777 24.4862C35.9291 25.0358 36.6933 26.4386 36.4498 27.7429C36.181 29.1784 35.0556 30.171 33.6027 30.253C32.5025 30.3104 31.5871 29.9249 30.932 29.1128C30.3021 28.3335 30.109 27.103 30.4869 26.1515C30.8144 25.2983 31.7215 24.5108 32.6453 24.2812C33.1912 24.1499 34.115 24.2401 34.6777 24.4862Z" fill="white"/>
                        </svg>
                        <Link className="font-bold h-5 mt-1 text-[#E0E0E0]" to="/">
                            <span className="text-white text-2xl leading-none">ScraperCar</span>
                        </Link>
                    </div>
                    {/* Card */}
                    <div className="relative w-full">
                        <Glass
                            cornerRadius="40px"
                            blur="16px"
                            bgOpacity={0.15}
                            borderOpacity={0.25}
                            brightness={1.1}
                            saturation={1.2}
                            shadowOpacity={0.2}
                        >
                            <div className="p-7 pt-13">
                                <span className="flex justify-center text-white text-center font-bold text-3xl">Login</span>
                                <form className="mt-10 grid" onSubmit={handleSubmit}>
                                    <div className="w-full grid gap-4 mb-1">
                                        <input
                                            className="outline-0 p-3 pt-4 w-full rounded-full bg-[#3B3B3B] h-12 border-none text-white placeholder:text-[#E0E0E0]/50 focus:ring-2 focus:ring-[#00FFFF]/50 transition-all"
                                            placeholder="Email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            disabled={isLoading}
                                        />
                                        <input
                                            className="outline-0 p-3 pt-4 w-full rounded-full bg-[#3B3B3B] h-12 border-none text-white placeholder:text-[#E0E0E0]/50 focus:ring-2 focus:ring-[#00FFFF]/50 transition-all"
                                            type="password"
                                            placeholder="Senha"
                                            value={senha}
                                            onChange={(e) => setSenha(e.target.value)}
                                            disabled={isLoading}
                                        />
                                        <Link className="w-[50%] justify-self-end flex" to="/resetsenha">
                                            <span className="w-full text-center text-[#C85BFF] text-sm">Esqueci minha senha</span>
                                        </Link>
                                    </div>

                                    {/* Mensagem de erro */}
                                    <div className="h-6 mb-4 flex items-center justify-center">
                                        {error && (
                                            <span className="text-red-400 text-sm text-center">{error}</span>
                                        )}
                                    </div>

                                    <button
                                        className="pt-3 h-11 justify-self-center text-white w-[50%] bg-[#AA00FF] rounded-full p-2 font-bold transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                                        type="submit"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Entrando...' : 'Entrar'}
                                    </button>
                                </form>
                                <div className="mt-10 grid justify-center gap-1">
                                    <span className="text-white">Ainda não tem uma conta?</span>
                                    <Link className="text-[#C85BFF] justify-self-center" to="/cadastro">Criar Conta</Link>
                                </div>
                            </div>
                        </Glass>
                    </div>
                </div>
            </div>
            <Analytics />
        </>
    )
}

export default Login