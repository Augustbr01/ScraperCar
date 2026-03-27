import { useCallback, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Glass } from "../components/GlassContainer"

export default function Cadastro() {
    const navigate = useNavigate()

    const [validandoNumero, setValidandoNumero] = useState(false)
    const [carregando, setCarregando] = useState(false)
    const [verificando, setVerificando] = useState(false)
    const [erro, setErro] = useState('')

    const [email, setEmail] = useState('')
    const [senha, setSenha] = useState('')
    const [nome, setNome] = useState('')
    const [telefone, setTelefone] = useState('')

    // dados que voltam da API
    const [codigoVerificacao, setCodigoVerificacao] = useState('')
    const [numeroBo, setNumeroBo] = useState('')

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault()
        setCarregando(true)
        setErro('')

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/cadastro`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, email, telefone, senha })
            })

            if (!response.ok) throw new Error('Erro ao cadastrar.')

            const data = await response.json()

            setCodigoVerificacao(data.codigoVerificacao)
            setNumeroBo(data.numeroBo)
            setValidandoNumero(true)

        } catch (err) {
            setErro(err.message || 'Erro inesperado. Tente novamente.')
        } finally {
            setCarregando(false)
        }
    }, [nome, email, telefone, senha])

    const handleVerificar = useCallback(async () => {
        setVerificando(true)
        setErro('')

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/verify/status?phone=${telefone}`)

            if (!response.ok) throw new Error('Código ainda não confirmado.')

            const data = await response.json()

            if (!data.verificado) throw new Error('Código ainda não confirmado.')

            navigate('/dashboard')
        } catch (err) {
            setErro(err.message)
        } finally {
            setVerificando(false)
        }
    }, [telefone, navigate])

    return (
        <div className='bg-[#0A0A0A] min-h-screen overflow-x-hidden relative flex items-center justify-center'>
            <div className='absolute z-0 -top-40 -right-20 w-[500px] h-[500px] bg-[#00FFFF]/70 rounded-full blur-[200px]' />

            <div className="justify-items-center w-[90%] max-w-md h-auto">
                <div className="mb-2 absolute flex top-20 items-center gap-3 self-start">
                    {/* seu SVG aqui */}
                    <a className="font-bold text-[#E0E0E0]" href="/">
                        <span className="text-white text-2xl leading-none relative top-1">ScraperCar</span>
                    </a>
                </div>

                <div className="relative w-full">
                    <Glass cornerRadius="40px" blur="16px" bgOpacity={0.15} borderOpacity={0.25} brightness={1.1} saturation={1.2} shadowOpacity={0.2}>

                        {/* ─── ETAPA 1: Formulário ─── */}
                        {!validandoNumero && (
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
                                    <a className="text-[#C85BFF] justify-self-center" href="/login">Entrar</a>
                                </div>
                            </div>
                        )}

                        {/* ─── ETAPA 2: Verificação WhatsApp ─── */}
                        {validandoNumero && (
                            <div className="p-7 pt-13 flex flex-col items-center gap-6">
                                <div className="w-14 h-14 rounded-full bg-[#25D366]/20 flex items-center justify-center">
                                    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="#25D366">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                                        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.122 1.523 5.862L0 24l6.304-1.654A11.946 11.946 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.369l-.36-.214-3.737.98.998-3.648-.235-.374A9.818 9.818 0 1112 21.818z"/>
                                    </svg>
                                </div>

                                <div className="text-center">
                                    <h2 className="text-white font-bold text-xl mb-1">Verificar WhatsApp</h2>
                                    <p className="text-[#E0E0E0]/60 text-sm">
                                        Envie o código abaixo para o número via WhatsApp
                                    </p>
                                </div>

                                {/* Número destino vindo da API */}
                                <div className="w-full bg-[#3B3B3B]/60 rounded-2xl p-4 flex flex-col items-center gap-1">
                                    <span className="text-[#E0E0E0]/50 text-xs uppercase tracking-widest">Enviar para</span>
                                    <span className="text-white font-bold text-lg tracking-wider">{numeroBo}</span>
                                </div>

                                {/* Código vindo da API */}
                                <div className="w-full bg-[#AA00FF]/10 border border-[#AA00FF]/30 rounded-2xl p-4 flex flex-col items-center gap-1">
                                    <span className="text-[#E0E0E0]/50 text-xs uppercase tracking-widest">Seu código</span>
                                    <span className="text-[#C85BFF] font-bold text-3xl tracking-[0.3em]">{codigoVerificacao}</span>
                                </div>

                                <p className="text-[#E0E0E0]/40 text-xs text-center">
                                    Abra o WhatsApp, envie exatamente o código acima e clique em verificar.
                                </p>

                                {erro && <span className="text-red-400 text-sm text-center">{erro}</span>}

                                <button
                                    onClick={handleVerificar}
                                    disabled={verificando}
                                    className="h-11 w-[70%] bg-[#AA00FF] disabled:opacity-50 disabled:cursor-not-allowed rounded-full text-white font-bold"
                                >
                                    {verificando ? 'Verificando...' : 'Já enviei, verificar'}
                                </button>

                                <button
                                    onClick={() => setValidandoNumero(false)}
                                    className="text-[#E0E0E0]/40 text-sm hover:text-white transition-colors"
                                >
                                    Voltar ao cadastro
                                </button>
                            </div>
                        )}
                    </Glass>
                </div>
            </div>
        </div>
    )
}