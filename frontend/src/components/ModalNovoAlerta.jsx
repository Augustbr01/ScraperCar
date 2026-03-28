import { useState, useCallback } from 'react'
import { Glass } from './GlassContainer'

const inputClass = [
    'w-full bg-[#2a2a2a] border-none outline-none rounded-full',
    'px-4 py-[10px] text-[#E0E0E0] text-[13px] font-[Manjari,sans-serif]',
].join(' ')


/**
 * ModalNovoAlerta
 * Props:
 *   aberto     — boolean
 *   onFechar   — fn
 *   onCriar    — fn(payload) → Promise  (retorna do useAlertas.criarAlerta)
 */
export function ModalNovoAlerta({ aberto, onFechar, onCriar }) {
    const [salvando, setSalvando] = useState(false)

    const [form, setForm] = useState({
        marca: '',
        modelo: '',
        versao: '',
        faixaano1: '',
        faixaano2: '',
        valorinicio: '',
        valorfim: '',
        kmfim: '',
        intervalo: 30,
    })

    const handleChange = useCallback((campo, valor) => {
        setForm(prev => ({ ...prev, [campo]: valor }))
    }, [])

    const handleSubmit = useCallback(async () => {
        const payload = {
            marca: Number(form.marca) || form.marca,
            modelo: form.modelo,
            versao: form.versao || undefined,
            faixaano1: form.faixaano1 ? Number(form.faixaano1) : undefined,
            faixaano2: form.faixaano2 ? Number(form.faixaano2) : undefined,
            valorinicio: form.valorinicio ? Number(form.valorinicio) : undefined,
            valorfim: form.valorfim ? Number(form.valorfim) : undefined,
            kmfim: form.kmfim || undefined,
            intervalo: Number(form.intervalo) || 30,
        }

        setSalvando(true)
        try {
            await onCriar(payload)
            setForm({
                marca: '', modelo: '', versao: '',
                faixaano1: '', faixaano2: '',
                valorinicio: '', valorfim: '',
                kmfim: '', intervalo: 30,
            })
            onFechar()
        } finally {
            setSalvando(false)
        }
    }, [form, onCriar, onFechar])

    if (!aberto) return null

    return (
        <>
            {/* Overlay */}
            <div
                onClick={onFechar}
                className="fixed inset-0 bg-black/50 z-100 backdrop-blur-sm"
            />

            {/* Modal */}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-101 w-[min(340px,90vw)]">
                <Glass cornerRadius="24px" blur="20px" bgOpacity={0.2} borderOpacity={0.3} shadowOpacity={0.4}>
                    <div className="px-6 pt-6 pb-7">

                        {/* Header */}
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-white font-bold text-[18px]">Novo Alerta</span>
                            <button
                                onClick={onFechar}
                                className="bg-[#2a2a2a] border-none rounded-lg w-7 h-7 cursor-pointer flex items-center justify-center text-[#E0E0E0]"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                            </button>
                        </div>

                        <p className="text-[#E0E0E0] opacity-50 text-[12px] mb-5 text-center">
                            Insira as informações do veículo
                        </p>

                        {/* Campos */}
                        <div className="flex flex-col gap-2.5">

                            <input
                                className={inputClass}
                                placeholder="Marca (ID numérico)"
                                type="number"
                                value={form.marca}
                                onChange={e => handleChange('marca', e.target.value)}
                            />

                            <input
                                className={inputClass}
                                placeholder="Modelo"
                                value={form.modelo}
                                onChange={e => handleChange('modelo', e.target.value)}
                            />

                            <input
                                className={inputClass}
                                placeholder="Versão"
                                value={form.versao}
                                onChange={e => handleChange('versao', e.target.value)}
                            />

                            {/* Ano inicial + Ano final */}
                            <div className="grid grid-cols-2 gap-2.5">
                                <input
                                    className={inputClass}
                                    placeholder="Ano inicial"
                                    type="number"
                                    value={form.faixaano1}
                                    onChange={e => handleChange('faixaano1', e.target.value)}
                                />
                                <input
                                    className={inputClass}
                                    placeholder="Ano final"
                                    type="number"
                                    value={form.faixaano2}
                                    onChange={e => handleChange('faixaano2', e.target.value)}
                                />
                            </div>

                            {/* Preço inicial + Preço final */}
                            <div className="grid grid-cols-2 gap-2.5">
                                <input
                                    className={inputClass}
                                    placeholder="Preço inicial"
                                    type="number"
                                    value={form.valorinicio}
                                    onChange={e => handleChange('valorinicio', e.target.value)}
                                />
                                <input
                                    className={inputClass}
                                    placeholder="Preço final"
                                    type="number"
                                    value={form.valorfim}
                                    onChange={e => handleChange('valorfim', e.target.value)}
                                />
                            </div>

                            <input
                                className={inputClass}
                                placeholder="KM máximo (ex: 80000)"
                                type="number"
                                value={form.kmfim}
                                onChange={e => handleChange('kmfim', e.target.value)}
                            />

                            <input
                                className={inputClass}
                                placeholder="Intervalo de alerta (minutos)"
                                type="number"
                                value={form.intervalo}
                                onChange={e => handleChange('intervalo', e.target.value)}
                            />
                        </div>

                        {/* Info */}
                        <div className="mt-4 bg-white/5 rounded-xl px-3.5 py-2.5 flex gap-2.5 items-start">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0 mt-px">
                                <circle cx="12" cy="12" r="10" stroke="#60a5fa" strokeWidth="1.5"/>
                                <path d="M12 8v4M12 16h.01" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                            <span className="text-[#E0E0E0] opacity-50 text-[11px] leading-normal">
                                Ao criar o alerta, o usuário receberá todos os anúncios presentes até o atual momento da criação.
                            </span>
                        </div>

                        {/* Botão */}
                        <button
                            onClick={handleSubmit}
                            disabled={salvando || !form.marca || !form.modelo}
                            className={[
                                'mt-5 w-full h-11 rounded-full border-none',
                                'text-white font-bold text-[14px] font-[Manjari,sans-serif]',
                                'transition-all duration-200',
                                salvando ? 'bg-[#7a00cc] cursor-not-allowed' : 'bg-[#AA00FF] cursor-pointer',
                                (!form.marca || !form.modelo) ? 'opacity-50' : 'opacity-100',
                            ].join(' ')}
                        >
                            {salvando ? 'Criando...' : 'Criar Alerta'}
                        </button>

                    </div>
                </Glass>
            </div>
        </>
    )
}