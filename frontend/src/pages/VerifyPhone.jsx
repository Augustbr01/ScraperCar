import { useCallback, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Glass } from "../components/GlassContainer"
import { verificarWhatsapp, trocarNumero } from "../services/authService.js"

export default function VerificacaoWhatsapp({
                                                telefone: telefoneProp,
                                                codigoVerificacao: codigoProp,
                                                numeroBo: numerosProp,
                                                onSucesso,
                                                onVoltar
                                            }) {
    const navigate = useNavigate()
    const location = useLocation()

    const [telefone, setTelefone] = useState(telefoneProp ?? location.state?.telefone)
    const [codigoVerificacao, setCodigoVerificacao] = useState(codigoProp ?? location.state?.codigoVerificacao)
    const [numeroBo, setNumeroBo] = useState(numerosProp ?? location.state?.numeroBo)

    const [verificando, setVerificando] = useState(false)
    const [erro, setErro] = useState('')
    const [trocandoNumero, setTrocandoNumero] = useState(false)
    const [novoTelefone, setNovoTelefone] = useState('')
    const [trocando, setTrocando] = useState(false)

    const handleVerificar = useCallback(async () => {
        setVerificando(true)
        setErro('')
        try {
            await verificarWhatsapp(telefone)
            if (onSucesso) onSucesso()
            else navigate('/dashboard')
        } catch (err) {
            setErro(err.response?.data?.message || err.message || 'Erro inesperado. Tente novamente.')
        } finally {
            setVerificando(false)
        }
    }, [telefone, navigate, onSucesso])

    const handleTrocarNumero = useCallback(async () => {
        if (!novoTelefone) return
        setTrocando(true)
        setErro('')
        try {
            const data = await trocarNumero(novoTelefone)
            setTelefone(data.telefone)
            setNumeroBo(data.numeroBot)
            setCodigoVerificacao(data.codigo)
            setTrocandoNumero(false)
            setNovoTelefone('')
        } catch (err) {
            setErro(err.response?.data?.message || err.message || 'Erro ao trocar número.')
        } finally {
            setTrocando(false)
        }
    }, [novoTelefone])

    return (
        <div className='bg-[#0A0A0A] min-h-screen overflow-x-hidden relative flex items-center justify-center'>
            <div className='absolute z-0 -top-40 -right-20 w-125 h-125 bg-[#00FFFF]/70 rounded-full blur-[200px]' />

            {/* Extra glow no desktop */}
            <div className='absolute z-0 bottom-0 left-0 w-96 h-96 bg-[#AA00FF]/20 rounded-full blur-[150px]' />

            <div className="justify-items-center w-[90%] max-w-md h-auto z-10">
                <div className="relative w-full">
                    <Glass cornerRadius="40px" blur="16px" bgOpacity={0.15} borderOpacity={0.25} brightness={1.1} saturation={1.2} shadowOpacity={0.2}>
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

                            <div className="w-full bg-[#3B3B3B]/60 rounded-2xl p-4 flex flex-col items-center gap-1">
                                <span className="text-[#E0E0E0]/50 text-xs uppercase tracking-widest">Enviar para</span>
                                <span className="text-white font-bold text-lg tracking-wider">{numeroBo}</span>
                            </div>

                            <div className="w-full bg-[#AA00FF]/10 border border-[#AA00FF]/30 rounded-2xl p-4 flex flex-col items-center gap-1">
                                <span className="text-[#E0E0E0]/50 text-xs uppercase tracking-widest">Seu código</span>
                                <span className="text-[#C85BFF] font-bold text-3xl tracking-[0.3em]">{codigoVerificacao}</span>
                            </div>

                            <div className="w-full bg-[#00FFFF]/10 border border-[#00FFFF]/30 rounded-2xl p-4 flex flex-col items-center gap-1">
                                <span className="text-[#E0E0E0]/50 text-xs uppercase tracking-widest">Seu telefone inserido</span>
                                <span className="text-white font-bold text-lg tracking-wider">{telefone}</span>
                            </div>

                            {trocandoNumero ? (
                                <div className="w-full flex flex-col gap-3">
                                    <input
                                        className="outline-0 p-3 w-full rounded-full bg-[#3B3B3B] h-12 border-none text-white placeholder:text-[#E0E0E0]/50 focus:ring-2 focus:ring-[#00FFFF]/50 transition-all"
                                        placeholder="Insira o numero de telefone"
                                        value={novoTelefone}
                                        onChange={(e) => setNovoTelefone(e.target.value)}
                                        disabled={trocando}
                                    />
                                    <div className="flex gap-3 justify-center">
                                        <button
                                            onClick={handleTrocarNumero}
                                            disabled={trocando || !novoTelefone}
                                            className="h-10 px-6 bg-[#AA00FF] disabled:opacity-50 rounded-full text-white font-bold text-sm"
                                        >
                                            {trocando ? 'Salvando...' : 'Confirmar'}
                                        </button>
                                        <button
                                            onClick={() => { setTrocandoNumero(false); setErro('') }}
                                            className="h-10 px-6 rounded-full text-[#E0E0E0]/50 text-sm hover:text-white transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setTrocandoNumero(true)}
                                    className="text-[#00FFFF]/60 text-sm hover:text-[#00FFFF] transition-colors"
                                >
                                    Coloquei o número errado
                                </button>
                            )}

                            <p className="text-[#E0E0E0]/40 text-xs text-center">
                                Abra o WhatsApp, envie exatamente o código acima e clique em verificar.
                            </p>

                            <a target={"_blank"} href={`https://wa.me/+5517982156721?text=${codigoVerificacao}`} className="text-[#39FF14]/40 text-xs text-center">
                                Link direto para o WhatsApp
                            </a>

                            {erro && <span className="text-red-400 text-sm text-center">{erro}</span>}

                            <button
                                onClick={handleVerificar}
                                disabled={verificando || trocandoNumero}
                                className="h-11 w-[70%] bg-[#AA00FF] disabled:opacity-50 disabled:cursor-not-allowed rounded-full text-white font-bold hover:shadow-[0_0_20px_rgba(170,0,255,0.5)] transition-shadow"
                            >
                                {verificando ? 'Verificando...' : 'Já enviei, verificar'}
                            </button>

                            {onVoltar && (
                                <button
                                    onClick={onVoltar}
                                    className="text-[#E0E0E0]/40 text-sm hover:text-white transition-colors"
                                >
                                    Voltar ao login
                                </button>
                            )}
                        </div>
                    </Glass>
                </div>
            </div>
        </div>
    )
}