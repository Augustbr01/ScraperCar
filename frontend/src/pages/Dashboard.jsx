import React, { useState, useCallback, Suspense } from 'react'
import Navbar from '../components/Navbar'
import { useAlertas } from '../hooks/useAlertas'
import { CardAlerta } from '../components/Cardalerta'
const ModalNovoAlerta = React.lazy(() => import('../components/ModalNovoAlerta').then(m => ({ default: m.ModalNovoAlerta })))
import { ModalGerenciarAlerta } from '../components/Modalgerenciaralerta'
import { Toast } from '../components/Toast'
import { Analytics } from '@vercel/analytics/react'

function Dashboard() {
    const [modalCriarAberto, setModalCriarAberto] = useState(false)
    const [alertaSelecionado, setAlertaSelecionado] = useState(null)
    const [toast, setToast] = useState({ mensagem: '', tipo: 'sucesso' })

    const mostrarToast = useCallback((mensagem, tipo = 'sucesso') => {
        setToast({ mensagem, tipo })
    }, [])

    const fecharToast = useCallback(() => {
        setToast({ mensagem: '', tipo: 'sucesso' })
    }, [])

    const { alertas, carregando, erro, criarAlerta, deletarAlerta, toggleAlerta } = useAlertas()

    const handleCriar = useCallback(async (payload) => {
        try {
            await criarAlerta(payload)
            mostrarToast('O Alerta foi criado com sucesso!', 'sucesso')
        } catch (err) {
            const msg = err.response?.data?.message || 'Ocorreu um erro ao salvar os dados'
            mostrarToast(msg, 'erro')
            throw err
        }
    }, [criarAlerta, mostrarToast])

    const handleToggle = useCallback(async (id) => {
        try {
            const mensagem = await toggleAlerta(id)
            mostrarToast(typeof mensagem === 'string' ? mensagem : 'Status atualizado!', 'sucesso')
        } catch (err) {
            const msg = err.response?.data?.message || 'Ocorreu um erro ao atualizar o alerta'
            mostrarToast(msg, 'erro')
            throw err
        }
    }, [toggleAlerta, mostrarToast])

    const handleDeletar = useCallback(async (id) => {
        try {
            await deletarAlerta(id)
            mostrarToast('Alerta removido com sucesso.', 'sucesso')
        } catch (err) {
            const msg = err.response?.data?.message || 'Ocorreu um erro ao remover o alerta'
            mostrarToast(msg, 'erro')
            throw err
        }
    }, [deletarAlerta, mostrarToast])

    return (
        <section className="bg-[#0A0A0A] min-h-screen overflow-x-hidden overflow-y-hidden relative">
            {/* Glows de fundo */}
            <div className="absolute z-0 -top-40 -right-20 md:-right-100 md:-top-100 w-125 h-125 md:w-200 md:h-200 bg-[#00FFFF]/20 md:bg-[#00FFFF]/50 rounded-full blur-[200px] md:blur-[300px]" />
            <div className="absolute z-10 bottom-0 left-0 md:-bottom-120 md:-left-80 w-96 h-96 md:w-200 md:h-200 bg-[#AA00FF]/20 md:bg-[#AA00FF]/60 rounded-full md:blur-[300px] blur-[200px]" />

            <Navbar />

            <div className="relative pt-35 px-5 m-auto md:w-screen md:pt-25 md:px-50">
                <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-20 lg:items-start lg:mt-15">

                    {/* ── Sidebar (desktop only) ── */}
                    <aside className="hidden lg:flex lg:flex-col gap-5 sticky top-28">

                        {/* Card de status */}
                        <div className="bg-white/4 border border-white/8 rounded-[20px] px-6 py-5">
                            <div className="flex items-center gap-2 mb-4 h-10">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-white mt-1 font-semibold text-sm">Monitorando</span>
                            </div>

                            <div className="flex flex-col gap-2.5">
                                {[
                                    { label: 'Backend', ok: true },
                                    { label: 'Scraper', ok: true },
                                    { label: 'WPP API', ok: true },
                                ].map(({ label, ok }) => (
                                    <div key={label} className="flex justify-between items-center">
                                        <span className="text-white/60 text-[13px]">{label}</span>
                                        <div className="flex items-center gap-1.5">
                                            <div className={`w-[7px] h-[7px] rounded-full ${ok ? 'bg-green-500' : 'bg-red-500'}`} />
                                            <span className={`text-xs font-medium ${ok ? 'text-green-500' : 'text-red-500'}`}>
                                                {ok ? 'Online' : 'Offline'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Card de resumo de alertas */}
                        <div className="bg-white/4 border border-white/8 rounded-[20px] px-6 py-5">
                            <p className="text-white/50 text-xs mb-2 uppercase tracking-[0.08em]">
                                Resumo
                            </p>
                            <div className="flex justify-between items-center">
                                <span className="text-white/70 text-[13px]">Total de alertas</span>
                                <span className="text-white font-bold text-lg">
                                    {carregando ? '—' : alertas.length}
                                </span>
                            </div>
                            <div className="h-px bg-white/6 my-3" />
                            <div className="flex justify-between items-center">
                                <span className="text-white/70 text-[13px]">Ativos</span>
                                <span className="text-green-500 font-bold text-lg">
                                    {carregando ? '—' : alertas.filter(a => a.ativo).length}
                                </span>
                            </div>
                        </div>

                        {/* Botão de criar alerta na sidebar */}
                        <button
                            onClick={() => setModalCriarAberto(true)}
                            className="w-full h-12 rounded-full bg-[#AA00FF] flex items-center justify-center gap-2 text-white font-bold text-sm shadow-[0_4px_24px_rgba(170,0,255,0.35)] transition-[transform,box-shadow] duration-200 hover:scale-[1.03] hover:shadow-[0_8px_32px_rgba(170,0,255,0.5)]"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
                            </svg>
                            <span className="h-4 mt-0.5">Novo Alerta</span>
                        </button>
                    </aside>

                    {/* ── Área principal de conteúdo ── */}
                    <main>
                        <h1 className="text-white text-4xl font-bold mb-7 text-center">
                            Meus alertas
                        </h1>

                        {/* Skeleton de carregamento */}
                        {carregando && (
                            <div className="flex flex-col gap-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-20 rounded-[18px] bg-white/4 border border-white/6 animate-pulse" />
                                ))}
                            </div>
                        )}

                        {!carregando && erro && (
                            <div className="text-center text-red-500 py-10 px-5 text-sm">
                                {erro}
                            </div>
                        )}

                        {!carregando && !erro && alertas.length === 0 && (
                            <div className="text-center py-[60px] px-5 text-white/30">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="mx-auto mb-4 block">
                                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"
                                          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <p className="text-base font-semibold mb-1.5">Nenhum alerta ainda</p>
                                <p className="text-[13px]">Crie seu primeiro alerta clicando no botão abaixo.</p>
                            </div>
                        )}

                        {!carregando && !erro && alertas.length > 0 && (
                            <div className="flex flex-col gap-3">
                                {alertas.map(alerta => (
                                    <CardAlerta
                                        key={alerta.id}
                                        alerta={alerta}
                                        onClick={() => setAlertaSelecionado(alerta)}
                                    />
                                ))}
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* Botão flutuante — apenas no mobile */}
            <button
                onClick={() => setModalCriarAberto(true)}
                title="Criar novo alerta"
                className="md:hidden fixed bottom-8 right-6 w-14 h-14 rounded-full bg-[#AA00FF] flex items-center justify-center shadow-[0_4px_24px_rgba(170,0,255,0.4)] transition-[transform,box-shadow] duration-200 hover:scale-110 hover:shadow-[0_8px_32px_rgba(170,0,255,0.6)] z-50"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
            </button>

            <Suspense fallback={null}>
                <ModalNovoAlerta
                    aberto={modalCriarAberto}
                    onFechar={() => setModalCriarAberto(false)}
                    onCriar={handleCriar}
                />
            </Suspense>

            <ModalGerenciarAlerta
                alerta={alertaSelecionado}
                onFechar={() => setAlertaSelecionado(null)}
                onToggle={handleToggle}
                onDeletar={handleDeletar}
            />

            <Toast
                mensagem={toast.mensagem}
                tipo={toast.tipo}
                onFechar={fecharToast}
            />
            <Analytics />
        </section>
    )
}

export default Dashboard