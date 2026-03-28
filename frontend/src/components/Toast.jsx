import { useEffect, useState } from 'react'

/**
 * Toast — feedback visual temporário
 * Props:
 *   mensagem  — texto a exibir
 *   tipo      — "sucesso" | "erro"
 *   onFechar  — chamado quando o toast some (para limpar o state do pai)
 */
export function Toast({ mensagem, tipo, onFechar }) {
    const [visivel, setVisivel] = useState(false)

    useEffect(() => {
        if (!mensagem) return

        const t1 = setTimeout(() => setVisivel(true), 10)
        const t2 = setTimeout(() => setVisivel(false), 3000)
        const t3 = setTimeout(() => onFechar?.(), 3400)

        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
    }, [mensagem, onFechar])

    if (!mensagem) return null

    const isSucesso = tipo === 'sucesso'

    return (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-9999">

            <div
                className="min-w-75 max-w-[90vw] transition-all duration-300"
                style={{
                    transform: `translateY(${visivel ? '0' : '-20px'})`,
                    opacity: visivel ? 1 : 0,
                }}
            >
                <div className={[
                    'flex items-center gap-3 px-5 py-3.5 rounded-2xl',
                    'bg-[#1a1a1a] shadow-[0_8px_32px_rgba(0,0,0,0.4)]',
                    'border',
                    isSucesso ? 'border-green-500' : 'border-red-500',
                ].join(' ')}>

                    {/* Ícone de documento */}
                    <div className="w-9 h-9 rounded-lg bg-[#2a2a2a] flex items-center justify-center shrink-0">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M9 12h6M9 16h4M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-7-7z"
                                  stroke="#E0E0E0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M13 2v7h7" stroke="#E0E0E0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>

                    <span className="text-[#E0E0E0] text-[14px] font-medium flex-1">
                        {mensagem}
                    </span>

                    {/* Check ou X */}
                    {isSucesso ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M5 13l4 4L19 7" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6l12 12" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    )}
                </div>
            </div>
        </div>
    )
}