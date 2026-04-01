import { useCallback, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Glass } from "../components/GlassContainer"
import { cadastrarUsuario } from "../services/authService.js"
import { Analytics } from '@vercel/analytics/react'
import VerificacaoWhatsapp from "./VerifyPhone.jsx"

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
        <div className='bg-[#0A0A0A] min-h-screen overflow-x-hidden relative flex items-center justify-center'>
            <div className='absolute z-0 -top-40 -right-20 w-125 h-125 bg-[#00FFFF]/70 rounded-full blur-[200px]' />

            <div className="justify-items-center w-[90%] max-w-md h-auto">
                <div className="mb-2 absolute flex top-20 items-center gap-3 self-start">
                    <Link className="font-bold text-[#E0E0E0]" to="/">
                        <span className="text-white text-2xl leading-none relative top-1">ScraperCar</span>
                    </Link>
                </div>

                <div className="relative w-full">
                    <Glass cornerRadius="40px" blur="16px" bgOpacity={0.15} borderOpacity={0.25} brightness={1.1} saturation={1.2} shadowOpacity={0.2}>
                        <div className="p-7 pt-13">
                            <span className="flex justify-center text-white text-center font-bold text-2xl">
                                Cadastrar-se
                            </span>
                            <form className="mt-10 grid" onSubmit={handleSubmit}>
                                <div className="w-full grid gap-4 mb-10">
                                    <input className="outline-0 p-3 pt-4 w-full rounded-full bg-[#3B3B3B] h-10 border-none text-white placeholder:text-[#E0E0E0]/50"
                                           placeholder="Nome" type="text" value={nome}
                                           onChange={(e) => setNome(e.target.value)} required />

                                    <input className="outline-0 p-3 pt-4 w-full rounded-full bg-[#3B3B3B] h-10 border-none text-white placeholder:text-[#E0E0E0]/50"
                                           placeholder="Email" type="email" value={email}
                                           onChange={(e) => setEmail(e.target.value)} required />

                                    <input className="outline-0 p-3 pt-4 w-full rounded-full bg-[#3B3B3B] h-10 border-none text-white placeholder:text-[#E0E0E0]/50"
                                           type="password" placeholder="Senha" value={senha}
                                           onChange={(e) => setSenha(e.target.value)} required />

                                    <input className="outline-0 p-3 pt-4 w-full rounded-full bg-[#3B3B3B] h-10 border-none text-white placeholder:text-[#E0E0E0]/50"
                                           type="tel" placeholder="Telefone" value={telefone}
                                           onChange={(e) => setTelefone(e.target.value)} required />
                                </div>

                                {erro && <span className="text-red-400 text-sm text-center mb-4">{erro}</span>}

                                <button
                                    className="pt-3 h-11 justify-self-center text-white w-[50%] bg-[#AA00FF] rounded-full p-2 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                                    type="submit"
                                    disabled={carregando}
                                >
                                    {carregando ? 'Cadastrando...' : 'Criar Conta'}
                                </button>
                            </form>

                            <div className="mt-10 grid justify-center gap-1">
                                <span className="text-white">Tem uma conta?</span>
                                <Link className="text-[#C85BFF] justify-self-center" to="/login">Entrar</Link>
                            </div>
                        </div>
                    </Glass>
                </div>
            </div>
            <Analytics />
        </div>
    )
}