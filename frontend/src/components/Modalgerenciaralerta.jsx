import { useState } from 'react'

/**
 * ModalGerenciarAlerta
 * Props:
 *   alerta     — objeto do alerta selecionado (ou null)
 *   onFechar   — fn
 *   onToggle   — fn(id) → Promise<string> (mensagem do backend)
 *   onDeletar  — fn(id) → Promise
 */
export function ModalGerenciarAlerta({ alerta, onFechar, onToggle, onDeletar }) {
    const [carregando, setCarregando] = useState(null) // 'toggle' | 'delete' | null

    if (!alerta) return null

    const descricao = [
        alerta.nomeMarca,
        alerta.modelo,
        alerta.versao,
        alerta.anoMin && alerta.anoMax ? `${alerta.anoMin}–${alerta.anoMax}` : null,
    ].filter(Boolean).join(' ')

    const handleToggle = async () => {
        setCarregando('toggle')
        try {
            await onToggle(alerta.id)
            onFechar()
        } finally {
            setCarregando(null)
        }
    }

    const handleDeletar = async () => {
        setCarregando('delete')
        try {
            await onDeletar(alerta.id)
            onFechar()
        } finally {
            setCarregando(null)
        }
    }

    return (
        <>
            {/* Overlay */}
            <div
                onClick={onFechar}
                className="fixed inset-0 bg-black/50 z-100 backdrop-blur-sm"
            />

            {/* Modal */}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-101 w-[min(320px,90vw)]">
                <div className="bg-[#111] rounded-[20px] p-6 shadow-[0_16px_48px_rgba(0,0,0,0.6)]">

                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-white font-bold text-[17px]">Gerenciar Alerta</span>
                        <button
                            onClick={onFechar}
                            className="bg-[#2a2a2a] border-none rounded-lg w-7 h-7 cursor-pointer flex items-center justify-center text-[#E0E0E0]"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                        </button>
                    </div>

                    {/* Descrição do alerta */}
                    <p className="text-[#E0E0E0] text-[13px] opacity-80 mb-6 leading-normal">
                        {descricao}
                    </p>

                    {/* Ações */}
                    <div className="flex gap-3 justify-center">

                        {/* Pause / Resume */}
                        <button
                            onClick={handleToggle}
                            disabled={!!carregando}
                            title={alerta.ativo ? 'Pausar alerta' : 'Retomar alerta'}
                            className={[
                                'w-12 h-12 rounded-full border-none cursor-pointer',
                                'flex items-center justify-center transition-opacity duration-200',
                                'bg-[#2a2a2a]',
                                carregando === 'toggle' ? 'opacity-50' : 'opacity-100',
                            ].join(' ')}
                        >
                            {alerta.ativo ? (
                                /* Ícone de pause */
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <rect x="6" y="5" width="4" height="14" rx="1" fill="#E0E0E0"/>
                                    <rect x="14" y="5" width="4" height="14" rx="1" fill="#E0E0E0"/>
                                </svg>
                            ) : (
                                /* Ícone de play */
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path d="M5 3l14 9-14 9V3z" fill="#E0E0E0"/>
                                </svg>
                            )}
                        </button>

                        {/* Editar — desabilitado por enquanto pois rota ainda não existe */}
                        <button
                            disabled
                            title="Editar (em breve)"
                            className="w-12 h-12 rounded-full border-none cursor-not-allowed flex items-center justify-center transition-opacity duration-200 bg-[#2a2a2a] opacity-30"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                                      stroke="#E0E0E0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                                      stroke="#E0E0E0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>

                        {/* Deletar */}
                        <button
                            onClick={handleDeletar}
                            disabled={!!carregando}
                            title="Excluir alerta"
                            className={[
                                'w-12 h-12 rounded-full cursor-pointer',
                                'flex items-center justify-center transition-opacity duration-200',
                                'bg-red-500/15 border border-red-500/30',
                                carregando === 'delete' ? 'opacity-50' : 'opacity-100',
                            ].join(' ')}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"
                                      stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M10 11v6M14 11v6" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                        </button>

                    </div>
                </div>
            </div>
        </>
    )
}