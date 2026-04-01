import { useState, useCallback, useMemo } from 'react'
import { Glass } from './GlassContainer'
import carData from '../data/shopcar_checkpoint.json'

const selectClass = [
    'w-full bg-[#2a2a2a] border-none outline-none rounded-full',
    'px-4 py-[10px] text-[13px] font-[Manjari,sans-serif]',
    'appearance-none cursor-pointer',
].join(' ')

const inputClass = [
    'w-full bg-[#2a2a2a] border-none outline-none rounded-full',
    'px-4 py-[10px] text-[#E0E0E0] text-[13px] font-[Manjari,sans-serif]',
].join(' ')

function SelectField({ value, onChange, options, placeholder, disabled }) {
    const isEmpty = !value
    return (
        <div className="relative w-full">
            <select
                className={[
                    selectClass,
                    isEmpty ? 'text-[#E0E0E0]/40' : 'text-[#E0E0E0]',
                    disabled ? 'opacity-30 cursor-not-allowed' : '',
                ].join(' ')}
                value={value}
                onChange={e => onChange(e.target.value)}
                disabled={disabled}
            >
                <option value="" disabled hidden>{placeholder}</option>
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}
                            style={{ background: '#1a1a1a', color: '#E0E0E0' }}>
                        {opt.label}
                    </option>
                ))}
            </select>
            {/* Seta custom */}
            <svg
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 opacity-40"
                width="10" height="10" viewBox="0 0 10 10" fill="none"
            >
                <path d="M1 3l4 4 4-4" stroke="#E0E0E0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        </div>
    )
}

/**
 * ModalNovoAlerta
 * Props:
 *   aberto     — boolean
 *   onFechar   — fn
 *   onCriar    — fn(payload) → Promise
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

    // ─── Opções derivadas do JSON ────────────────────────────────────────────

    const marcaOptions = useMemo(() =>
            Object.entries(carData.Carros)
                .map(([nome, data]) => ({ value: String(data._id), label: nome }))
                .sort((a, b) => a.label.localeCompare(b.label)),
        []
    )

    const marcaSelecionada = useMemo(() =>
            Object.values(carData.Carros).find(d => String(d._id) === form.marca),
        [form.marca]
    )

    const modeloOptions = useMemo(() => {
        if (!marcaSelecionada) return []
        return Object.keys(marcaSelecionada.modelos)
            .map(nome => ({ value: nome, label: nome }))
            .sort((a, b) => a.label.localeCompare(b.label))
    }, [marcaSelecionada])

    const versaoOptions = useMemo(() => {
        if (!marcaSelecionada || !form.modelo) return []
        const versoes = marcaSelecionada.modelos[form.modelo]
        if (!versoes) return []
        return Object.keys(versoes)
            .map(nome => ({ value: nome, label: nome }))
            .sort((a, b) => a.label.localeCompare(b.label))
    }, [marcaSelecionada, form.modelo])

    const anosDisponiveis = useMemo(() => {
        if (!marcaSelecionada || !form.modelo || !form.versao) return []
        const anos = marcaSelecionada.modelos[form.modelo]?.[form.versao] ?? []
        return anos
            .filter(a => a !== 'Novo')
            .map(a => ({ value: a, label: a }))
            .sort((a, b) => Number(b.value) - Number(a.value))
    }, [marcaSelecionada, form.modelo, form.versao])

    const IntervalosDisponiveis = [
        { value: '30',   label: '30 minutos' },
        { value: '60',   label: '1 hora'     },
        { value: '120',  label: '2 horas'    },
        { value: '300',  label: '5 horas'    },
        { value: '600',  label: '10 horas'   },
        { value: '720',  label: '12 horas'   },
        { value: '1440', label: '24 horas'   },
    ]

    // ─── Handlers ────────────────────────────────────────────────────────────

    const handleChange = useCallback((campo, valor) => {
        setForm(prev => {
            const next = { ...prev, [campo]: valor }
            // Resetar campos dependentes
            if (campo === 'marca')  { next.modelo = ''; next.versao = ''; next.faixaano1 = ''; next.faixaano2 = '' }
            if (campo === 'modelo') { next.versao = ''; next.faixaano1 = ''; next.faixaano2 = '' }
            if (campo === 'versao') { next.faixaano1 = ''; next.faixaano2 = '' }
            return next
        })
    }, [])

    const handleSubmit = useCallback(async () => {
        const marcaNome = Object.entries(carData.Carros)
            .find(([, d]) => String(d._id) === form.marca)?.[0] ?? form.marca

        const payload = {
            marca: Number(form.marca) || form.marca,
            marcaNome,
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

                            {/* Marca */}
                            <SelectField
                                value={form.marca}
                                onChange={v => handleChange('marca', v)}
                                options={marcaOptions}
                                placeholder="Marca"
                            />

                            {/* Modelo */}
                            <SelectField
                                value={form.modelo}
                                onChange={v => handleChange('modelo', v)}
                                options={modeloOptions}
                                placeholder="Modelo"
                                disabled={!form.marca}
                            />

                            {/* Versão */}
                            <SelectField
                                value={form.versao}
                                onChange={v => handleChange('versao', v)}
                                options={versaoOptions}
                                placeholder="Versão"
                                disabled={!form.modelo}
                            />

                            {/* Ano inicial + Ano final */}
                            <div className="grid grid-cols-2 gap-2.5">
                                <SelectField
                                    value={form.faixaano1}
                                    onChange={v => handleChange('faixaano1', v)}
                                    options={anosDisponiveis}
                                    placeholder="Ano inicial"
                                    disabled={!form.versao}
                                />
                                <SelectField
                                    value={form.faixaano2}
                                    onChange={v => handleChange('faixaano2', v)}
                                    options={anosDisponiveis}
                                    placeholder="Ano final"
                                    disabled={!form.versao}
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

                            <SelectField
                                value={String(form.intervalo)}
                                onChange={v => handleChange('intervalo', v)}
                                options={IntervalosDisponiveis}
                                placeholder="Intervalo de alerta"
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